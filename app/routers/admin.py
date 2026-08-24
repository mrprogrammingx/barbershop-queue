from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import QueueEntry, ShopStatus, QueueStatus
from app.schemas import ShopStatusOut, ShopStatusUpdate, ShopHoursUpdate
from app.timezone import today

router = APIRouter(prefix="/admin", tags=["admin"])


def _get_or_create_shop_status(db: Session) -> ShopStatus:
    status = db.query(ShopStatus).first()
    if status is None:
        status = ShopStatus(is_open=True)
        db.add(status)
        db.commit()
        db.refresh(status)
    return status


@router.get("/shop-status", response_model=ShopStatusOut)
def get_shop_status(db: Session = Depends(get_db)):
    return _get_or_create_shop_status(db)


@router.post("/shop-status", response_model=ShopStatusOut)
def set_shop_status(payload: ShopStatusUpdate, db: Session = Depends(get_db)):
    status = _get_or_create_shop_status(db)
    status.is_open = payload.is_open
    db.commit()
    db.refresh(status)
    return status


@router.post("/hours", response_model=ShopStatusOut)
def set_shop_hours(payload: ShopHoursUpdate, db: Session = Depends(get_db)):
    status = _get_or_create_shop_status(db)
    status.hours = payload.hours
    db.commit()
    db.refresh(status)
    return status


@router.post("/reset-queue")
def reset_queue(db: Session = Depends(get_db)):
    """Marks all of today's active queue entries as done, effectively resetting the queue."""
    entries = (
        db.query(QueueEntry)
        .filter(QueueEntry.queue_date == today())
        .filter(QueueEntry.status.in_([QueueStatus.waiting, QueueStatus.next, QueueStatus.in_progress]))
        .all()
    )
    for entry in entries:
        entry.status = QueueStatus.done
    db.commit()
    return {"reset_count": len(entries)}
