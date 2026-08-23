from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict

from app.models import QueueStatus


class CheckInRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None


class QueueEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    queue_date: date
    position: int
    status: QueueStatus
    created_at: datetime
    customer: CustomerOut


class QueueStatusUpdate(BaseModel):
    status: QueueStatus


class ShopStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    is_open: bool
    hours: Optional[str] = None


class ShopStatusUpdate(BaseModel):
    is_open: bool


class ShopHoursUpdate(BaseModel):
    hours: Optional[str] = None
