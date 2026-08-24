import enum
from datetime import time

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Date,
    Time,
    Enum,
    ForeignKey,
    Boolean,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base
from app.timezone import now, today


class QueueStatus(str, enum.Enum):
    waiting = "waiting"
    next = "next"
    in_progress = "in_progress"
    done = "done"
    no_show = "no_show"


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=now)

    queue_entries = relationship("QueueEntry", back_populates="customer")


class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    queue_date = Column(Date, default=today, index=True)
    position = Column(Integer, nullable=False)
    status = Column(Enum(QueueStatus), default=QueueStatus.waiting, nullable=False)
    note = Column(Text, nullable=True)
    appointment_time = Column(Time, nullable=False)

    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    customer = relationship("Customer", back_populates="queue_entries")


class BlockedSlot(Base):
    """A specific date+time slot the admin has excluded from booking (e.g. a lunch break)."""

    __tablename__ = "blocked_slots"
    __table_args__ = (UniqueConstraint("blocked_date", "blocked_time", name="uq_blocked_slot"),)

    id = Column(Integer, primary_key=True, index=True)
    blocked_date = Column(Date, nullable=False, index=True)
    blocked_time = Column(Time, nullable=False)
    created_at = Column(DateTime, default=now)


class IncludedSlot(Base):
    """A specific date+time slot the admin has added beyond normal open/close hours."""

    __tablename__ = "included_slots"
    __table_args__ = (UniqueConstraint("included_date", "included_time", name="uq_included_slot"),)

    id = Column(Integer, primary_key=True, index=True)
    included_date = Column(Date, nullable=False, index=True)
    included_time = Column(Time, nullable=False)
    created_at = Column(DateTime, default=now)


class ShopStatus(Base):
    """Singleton-style row holding shop scheduling settings."""

    __tablename__ = "shop_status"

    id = Column(Integer, primary_key=True, index=True)

    # Manual same-day override: turns new bookings for *today* on/off.
    # Independent of open_days (the weekly schedule) and existing appointments.
    booking_open = Column(Boolean, default=True, nullable=False)

    # Comma-separated weekday codes the shop is open, e.g. "mon,tue,wed,thu,fri"
    open_days = Column(String, default="mon,tue,wed,thu,fri,sat,sun", nullable=False)

    open_time = Column(Time, default=time(9, 0), nullable=False)
    close_time = Column(Time, default=time(18, 0), nullable=False)
    slot_duration_minutes = Column(Integer, default=30, nullable=False)
    capacity_per_slot = Column(Integer, default=1, nullable=False)

    updated_at = Column(DateTime, default=now, onupdate=now)
