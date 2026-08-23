from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, QueueEntry, QueueStatus, ShopStatus
from app.schemas import CheckInRequest, QueueEntryOut
from app.services.email import send_next_notification, send_turn_notification

router = APIRouter(prefix="/queue", tags=["queue"])


def _get_or_create_shop_status(db: Session) -> ShopStatus:
    status = db.query(ShopStatus).first()
    if status is None:
        status = ShopStatus(is_open=True)
        db.add(status)
        db.commit()
        db.refresh(status)
    return status


@router.post("/checkin", response_model=QueueEntryOut)
def check_in(payload: CheckInRequest, db: Session = Depends(get_db)):
    shop_status = _get_or_create_shop_status(db)
    if not shop_status.is_open:
        raise HTTPException(status_code=400, detail="Shop is currently closed")

    customer = Customer(name=payload.name, email=payload.email, phone=payload.phone)
    db.add(customer)
    db.flush()

    today = date.today()
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
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("", response_model=list[QueueEntryOut])
def list_queue(db: Session = Depends(get_db)):
    today = date.today()
    return (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today)
        .filter(QueueEntry.status.in_([QueueStatus.waiting, QueueStatus.next, QueueStatus.in_progress]))
        .order_by(QueueEntry.position.asc())
        .all()
    )


@router.get("/{entry_id}/position", response_model=QueueEntryOut)
def get_position(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if entry is None:
        raise HTTPException(status_code=404, detail="Queue entry not found")
    return entry


@router.post("/call-next", response_model=QueueEntryOut)
def call_next(db: Session = Depends(get_db)):
    today = date.today()

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
        .order_by(QueueEntry.position.asc())
        .first()
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="No customers waiting")

    entry.status = QueueStatus.in_progress
    entry.turn_notified_at = datetime.utcnow()
    db.commit()
    db.refresh(entry)

    send_turn_notification(entry.customer.email, entry.customer.name)

    _notify_upcoming_next(db, today)

    return entry


def _notify_upcoming_next(db: Session, today: date) -> None:
    upcoming = (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today, QueueEntry.status == QueueStatus.waiting)
        .order_by(QueueEntry.position.asc())
        .first()
    )
    if upcoming is None:
        return

    upcoming.status = QueueStatus.next
    upcoming.next_notified_at = datetime.utcnow()
    db.commit()
    send_next_notification(upcoming.customer.email, upcoming.customer.name)


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

    today = date.today()
    in_progress = (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today, QueueEntry.status == QueueStatus.in_progress)
        .first()
    )
    if in_progress is None:
        _notify_upcoming_next(db, today)

    return entry
