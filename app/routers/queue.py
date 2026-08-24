from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import require_admin
from app.database import get_db
from app.models import Customer, QueueEntry, QueueStatus, ShopStatus, BlockedSlot, IncludedSlot
from app.schemas import CheckInRequest, QueueEntryOut, QueueNoteUpdate, AvailableSlotOut, validate_phone
from app.services.email import send_admin_checkin_notification
from app.timezone import today as get_today

# Public: check-in, availability, and a customer's own booking lookup.
router = APIRouter(prefix="/queue", tags=["queue"])

# Staff-only: viewing/managing the live queue and history.
admin_router = APIRouter(prefix="/queue", tags=["queue"], dependencies=[Depends(require_admin)])


def _get_or_create_shop_status(db: Session) -> ShopStatus:
    status = db.query(ShopStatus).first()
    if status is None:
        status = ShopStatus(booking_open=True)
        db.add(status)
        db.commit()
        db.refresh(status)
    return status


WEEKDAY_CODES = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


def _is_open_day(shop_status: ShopStatus, queue_date: date) -> bool:
    open_days = set(shop_status.open_days.split(",")) if shop_status.open_days else set()
    return WEEKDAY_CODES[queue_date.weekday()] in open_days


def _base_slots(shop_status: ShopStatus, queue_date: date) -> list[time]:
    if not _is_open_day(shop_status, queue_date):
        return []

    slots = []
    cursor = datetime.combine(date.today(), shop_status.open_time)
    end = datetime.combine(date.today(), shop_status.close_time)
    step = timedelta(minutes=shop_status.slot_duration_minutes)
    while cursor < end:
        slots.append(cursor.time())
        cursor += step
    return slots


def _included_slot_times(db: Session, queue_date: date) -> set[time]:
    rows = (
        db.query(IncludedSlot.included_time)
        .filter(IncludedSlot.included_date == queue_date)
        .all()
    )
    return {row[0] for row in rows}


def _generate_slots(db: Session, shop_status: ShopStatus, queue_date: date) -> list[time]:
    slots = set(_base_slots(shop_status, queue_date)) | _included_slot_times(db, queue_date)
    return sorted(slots)


def _slot_booked_counts(db: Session, queue_date: date) -> dict[time, int]:
    rows = (
        db.query(QueueEntry.appointment_time, func.count(QueueEntry.id))
        .filter(QueueEntry.queue_date == queue_date)
        .filter(QueueEntry.status != QueueStatus.no_show)
        .group_by(QueueEntry.appointment_time)
        .all()
    )
    return {slot_time: count for slot_time, count in rows}


def _blocked_slot_times(db: Session, queue_date: date) -> set[time]:
    rows = (
        db.query(BlockedSlot.blocked_time)
        .filter(BlockedSlot.blocked_date == queue_date)
        .all()
    )
    return {row[0] for row in rows}


@router.get("/available-times", response_model=list[AvailableSlotOut])
def get_available_times(for_date: date | None = None, db: Session = Depends(get_db)):
    target_date = for_date or get_today()
    if target_date < get_today():
        raise HTTPException(status_code=400, detail="Cannot book a date in the past")

    shop_status = _get_or_create_shop_status(db)
    booked_counts = _slot_booked_counts(db, target_date)
    blocked_times = _blocked_slot_times(db, target_date)
    included_times = _included_slot_times(db, target_date)
    base_times = set(_base_slots(shop_status, target_date))

    return [
        AvailableSlotOut(
            time=slot,
            capacity=shop_status.capacity_per_slot,
            booked=booked_counts.get(slot, 0),
            blocked=slot in blocked_times,
            included=slot in included_times and slot not in base_times,
            available=slot not in blocked_times and booked_counts.get(slot, 0) < shop_status.capacity_per_slot,
        )
        for slot in _generate_slots(db, shop_status, target_date)
    ]


@router.post("/checkin", response_model=QueueEntryOut)
def check_in(payload: CheckInRequest, db: Session = Depends(get_db)):
    today = get_today()

    if payload.appointment_date < today:
        raise HTTPException(status_code=400, detail="Cannot book a date in the past")

    shop_status = _get_or_create_shop_status(db)
    if payload.appointment_date == today and not shop_status.booking_open:
        raise HTTPException(status_code=400, detail="Booking is currently closed for today")

    if payload.appointment_time not in _generate_slots(db, shop_status, payload.appointment_date):
        raise HTTPException(status_code=400, detail="Invalid appointment time")

    if payload.appointment_time in _blocked_slot_times(db, payload.appointment_date):
        raise HTTPException(status_code=400, detail="That time is not available")

    booked_count = _slot_booked_counts(db, payload.appointment_date).get(payload.appointment_time, 0)
    if booked_count >= shop_status.capacity_per_slot:
        raise HTTPException(status_code=400, detail="That time is fully booked")

    customer = db.query(Customer).filter(Customer.phone == payload.phone).first()
    if customer is None:
        customer = Customer(name=payload.name, phone=payload.phone)
        db.add(customer)
    else:
        customer.name = payload.name
    db.flush()

    max_position = (
        db.query(func.max(QueueEntry.position))
        .filter(QueueEntry.queue_date == payload.appointment_date)
        .scalar()
    )
    next_position = (max_position or 0) + 1

    entry = QueueEntry(
        customer_id=customer.id,
        queue_date=payload.appointment_date,
        position=next_position,
        status=QueueStatus.waiting,
        note=payload.note,
        appointment_time=payload.appointment_time,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    recipients = [email for email in (shop_status.notification_emails or "").split(",") if email]
    send_admin_checkin_notification(
        customer.name,
        customer.phone,
        entry.position,
        str(entry.appointment_time),
        entry.note,
        recipients=recipients,
    )

    return entry


@admin_router.get("", response_model=list[QueueEntryOut])
def list_queue(for_date: date | None = None, db: Session = Depends(get_db)):
    target_date = for_date or get_today()
    return (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == target_date)
        .filter(QueueEntry.status.in_([QueueStatus.waiting, QueueStatus.next, QueueStatus.in_progress]))
        .order_by(QueueEntry.appointment_time.asc(), QueueEntry.position.asc())
        .all()
    )


@router.get("/my-bookings", response_model=list[QueueEntryOut])
def get_my_bookings(phone: str, for_date: date | None = None, db: Session = Depends(get_db)):
    try:
        phone = validate_phone(phone)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    customer = db.query(Customer).filter(Customer.phone == phone).first()
    if customer is None:
        return []

    query = db.query(QueueEntry).filter(QueueEntry.customer_id == customer.id)
    if for_date is not None:
        query = query.filter(QueueEntry.queue_date == for_date)

    return query.order_by(QueueEntry.queue_date.desc(), QueueEntry.appointment_time.asc()).all()


@admin_router.get("/history/dates", response_model=list[date])
def list_history_dates(db: Session = Depends(get_db)):
    rows = (
        db.query(QueueEntry.queue_date)
        .distinct()
        .order_by(QueueEntry.queue_date.desc())
        .all()
    )
    return [row[0] for row in rows]


@admin_router.get("/history/{queue_date}", response_model=list[QueueEntryOut])
def get_history_for_date(queue_date: date, db: Session = Depends(get_db)):
    return (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == queue_date)
        .order_by(QueueEntry.appointment_time.asc(), QueueEntry.position.asc())
        .all()
    )


@admin_router.get("/{entry_id}/position", response_model=QueueEntryOut)
def get_position(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Queue entry not found")
    return entry


@admin_router.post("/{entry_id}/note", response_model=QueueEntryOut)
def set_note(entry_id: int, payload: QueueNoteUpdate, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    entry.note = payload.note
    db.commit()
    db.refresh(entry)
    return entry


@admin_router.post("/call-next", response_model=QueueEntryOut)
def call_next(db: Session = Depends(get_db)):
    today = get_today()

    in_progress = (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today, QueueEntry.status == QueueStatus.in_progress)
        .first()
    )
    if in_progress is not None:
        raise HTTPException(status_code=400, detail="A customer is already being served")

    entry = (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today)
        .filter(QueueEntry.status.in_([QueueStatus.waiting, QueueStatus.next]))
        .order_by(QueueEntry.appointment_time.asc(), QueueEntry.position.asc())
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="No customers waiting")

    entry.status = QueueStatus.in_progress
    db.commit()
    db.refresh(entry)

    _promote_upcoming_next(db, today)

    return entry


def _promote_upcoming_next(db: Session, today: date) -> None:
    upcoming = (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today, QueueEntry.status == QueueStatus.waiting)
        .order_by(QueueEntry.appointment_time.asc(), QueueEntry.position.asc())
        .first()
    )
    if upcoming is None:
        return

    upcoming.status = QueueStatus.next
    db.commit()


@admin_router.post("/{entry_id}/done", response_model=QueueEntryOut)
def mark_done(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    entry.status = QueueStatus.done
    db.commit()
    db.refresh(entry)
    return entry


@admin_router.post("/{entry_id}/no-show", response_model=QueueEntryOut)
def mark_no_show(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    entry.status = QueueStatus.no_show
    db.commit()
    db.refresh(entry)

    today = get_today()
    in_progress = (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today, QueueEntry.status == QueueStatus.in_progress)
        .first()
    )
    if in_progress is None:
        _promote_upcoming_next(db, today)

    return entry
