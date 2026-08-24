from datetime import datetime, date, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

from app.models import QueueStatus

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


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
    included: bool
    available: bool


class BlockedSlotRequest(BaseModel):
    date: date
    time: time


class BlockedSlotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    blocked_date: date
    blocked_time: time


class IncludedSlotRequest(BaseModel):
    date: date
    time: time


class IncludedSlotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    included_date: date
    included_time: time


class ShopStatusOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    booking_open: bool
    open_days: list[str]
    open_time: time
    close_time: time
    slot_duration_minutes: int
    capacity_per_slot: int

    @field_validator("open_days", mode="before")
    @classmethod
    def _split_open_days(cls, value):
        if isinstance(value, str):
            return [day for day in value.split(",") if day]
        return value


class ShopStatusUpdate(BaseModel):
    booking_open: bool


class OpenDaysUpdate(BaseModel):
    open_days: list[str]

    @field_validator("open_days")
    @classmethod
    def _validate_days(cls, value):
        invalid = set(value) - set(WEEKDAYS)
        if invalid:
            raise ValueError(f"Invalid weekday(s): {', '.join(sorted(invalid))}")
        return value


class ScheduleSettingsUpdate(BaseModel):
    open_time: time
    close_time: time
    slot_duration_minutes: int
    capacity_per_slot: int
