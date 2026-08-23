import enum
from datetime import datetime, date

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Date,
    Enum,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import relationship

from app.database import Base


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
    email = Column(String, nullable=False, unique=True, index=True)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    queue_entries = relationship("QueueEntry", back_populates="customer")


class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    queue_date = Column(Date, default=date.today, index=True)
    position = Column(Integer, nullable=False)
    status = Column(Enum(QueueStatus), default=QueueStatus.waiting, nullable=False)

    next_notified_at = Column(DateTime, nullable=True)
    turn_notified_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("Customer", back_populates="queue_entries")


class ShopStatus(Base):
    """Singleton-style table (one row per day) tracking whether the shop is open."""

    __tablename__ = "shop_status"

    id = Column(Integer, primary_key=True, index=True)
    is_open = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
