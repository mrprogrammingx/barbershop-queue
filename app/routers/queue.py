from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, QueueEntry, QueueStatus, ShopStatus
from app.schemas import CheckInRequest, QueueEntryOut, QueueNoteUpdate, AvailableSlotOut
from app.services.email import send_admin_checkin_notification
from app.timezone import today as get_today

router = APIRouter(prefix="/queue", tags=["queue"])


def _get_or_create_shop_status(db: Session) -> ShopStatus:
    status = db.query(ShopStatus).first()
    if status is None:
        status = ShopStatus(is_open=True)
        db.add(status)
        db.commit()
        db.refresh(status)
    return status


def _generate_slots(shop_status: ShopStatus) -> list[time]:
    slots = []
    cursor = datetime.combine(date.today(), shop_status.open_time)
    end = datetime.combine(date.today(), shop_status.close_time)
    step = timedelta(minutes=shop_status.slot_duration_minutes)
    while cursor < end:
        slots.append(cursor.time())
        cursor += step
    return slots


def _slot_booked_counts(db: Session, queue_date: date) -> dict[time, int]:
    rows = (
        db.query(QueueEntry.appointment_time, func.count(QueueEntry.id))
        .filter(QueueEntry.queue_date == queue_date)
        .filter(QueueEntry.status != QueueStatus.no_show)
        .group_by(QueueEntry.appointment_time)
        .all()
    )
    return {slot_time: count for slot_time, count in rows}


@router.get("/available-times", response_model=list[AvailableSlotOut])
def get_available_times(db: Session = Depends(get_db)):
    shop_status = _get_or_create_shop_status(db)
    today = get_today()
    booked_counts = _slot_booked_counts(db, today)

    return [
        AvailableSlotOut(
            time=slot,
            capacity=shop_status.capacity_per_slot,
            booked=booked_counts.get(slot, 0),
            available=booked_counts.get(slot, 0) < shop_status.capacity_per_slot,
        )
        for slot in _generate_slots(shop_status)
    ]


@router.post("/checkin", response_model=QueueEntryOut)
def check_in(payload: CheckInRequest, db: Session = Depends(get_db)):
    shop_status = _get_or_create_shop_status(db)
    if not shop_status.is_open:
        raise HTTPException(status_code=400, detail="Shop is currently closed")

    today = get_today()

    if payload.appointment_time not in _generate_slots(shop_status):
        raise HTTPException(status_code=400, detail="Invalid appointment time")

    booked_count = _slot_booked_counts(db, today).get(payload.appointment_time, 0)
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
        .filter(QueueEntry.queue_date == today)
        .scalar()
    )
    next_position = (max_position or 0) + 1

    entry = QueueEntry(
        customer_id=customer.id,
        queue_date=today,
        position=next_position,
        status=QueueStatus.waiting,
        note=payload.note,
        appointment_time=payload.appointment_time,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    send_admin_checkin_notification(
        customer.name, customer.phone, entry.position, str(entry.appointment_time), entry.note
    )

    return entry


@router.get("", response_model=list[QueueEntryOut])
def list_queue(db: Session = Depends(get_db)):
    today = get_today()
    return (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today)
        .filter(QueueEntry.status.in_([QueueStatus.waiting, QueueStatus.next, QueueStatus.in_progress]))
        .order_by(QueueEntry.appointment_time.asc(), QueueEntry.position.asc())
        .all()
    )


@router.get("/history/dates", response_model=list[date])
def list_history_dates(db: Session = Depends(get_db)):
    rows = (
        db.query(QueueEntry.queue_date)
        .distinct()
        .order_by(QueueEntry.queue_date.desc())
        .all()
    )
    return [row[0] for row in rows]


@router.get("/history/{queue_date}", response_model=list[QueueEntryOut])
def get_history_for_date(queue_date: date, db: Session = Depends(get_db)):
    return (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == queue_date)
        .order_by(QueueEntry.appointment_time.asc(), QueueEntry.position.asc())
        .all()
    )


@router.get("/{entry_id}/position", response_model=QueueEntryOut)
def get_position(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Queue entry not found")
    return entry


@router.post("/{entry_id}/note", response_model=QueueEntryOut)
def set_note(entry_id: int, payload: QueueNoteUpdate, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    entry.note = payload.note
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/call-next", response_model=QueueEntryOut)
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


@router.post("/{entry_id}/done", response_model=QueueEntryOut)
def mark_done(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Queue entry not found")

    entry.status = QueueStatus.done
    db.commit()
    db.refresh(entry)
    return entry


@router.post("/{entry_id}/no-show", response_model=QueueEntryOut)
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
