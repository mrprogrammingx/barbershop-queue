from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import QueueStatus


class CheckInRequest(BaseModel):
    name: str
    phone: str
    note: Optional[str] = None


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str


class CustomerListOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str
    created_at: datetime
    visit_count: int


class QueueEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    queue_date: date
    position: int
    status: QueueStatus
    note: Optional[str] = None
    created_at: datetime
    customer: CustomerOut


class QueueStatusUpdate(BaseModel):
    status: QueueStatus


class QueueNoteUpdate(BaseModel):
    note: Optional[str] = None


class ShopStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    is_open: bool
    hours: Optional[str] = None


class ShopStatusUpdate(BaseModel):
    is_open: bool


class ShopHoursUpdate(BaseModel):
    hours: Optional[str] = None
