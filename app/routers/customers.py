from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, QueueEntry
from app.schemas import CustomerListOut

router = APIRouter(prefix="/queue/customers", tags=["customers"])


@router.get("", response_model=list[CustomerListOut])
def list_customers(db: Session = Depends(get_db)):
    rows = (
        db.query(Customer, func.count(QueueEntry.id).label("visit_count"))
        .outerjoin(QueueEntry, QueueEntry.customer_id == Customer.id)
        .group_by(Customer.id)
        .order_by(Customer.name.asc())
        .all()
    )
    return [
        CustomerListOut(
            id=customer.id,
            name=customer.name,
            phone=customer.phone,
            created_at=customer.created_at,
            visit_count=visit_count,
        )
        for customer, visit_count in rows
    ]
