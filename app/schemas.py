from datetime import datetime, date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import QueueStatus


class CheckInRequest(BaseModel):
    name: str
    phone: str
    appointment_date: date
    appointment_time: time
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
    appointment_time: time
    created_at: datetime
    customer: CustomerOut


class QueueStatusUpdate(BaseModel):
    status: QueueStatus


class QueueNoteUpdate(BaseModel):
    note: Optional[str] = None


class AvailableSlotOut(BaseModel):
    time: time
    capacity: int
    booked: int
    blocked: bool
    available: bool


class BlockedSlotRequest(BaseModel):
    date: date
    time: time


class BlockedSlotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    blocked_date: date
    blocked_time: time


class ShopStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    is_open: bool
    hours: Optional[str] = None
    open_time: time
    close_time: time
    slot_duration_minutes: int
    capacity_per_slot: int


class ShopStatusUpdate(BaseModel):
    is_open: bool


class ShopHoursUpdate(BaseModel):
    hours: Optional[str] = None


class ScheduleSettingsUpdate(BaseModel):
    open_time: time
    close_time: time
    slot_duration_minutes: int
    capacity_per_slot: int
