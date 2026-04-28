from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Inquiry(Base):
    __tablename__ = "inquiries"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    inquiry_type: Mapped[str] = mapped_column(String(30), nullable=False)
    related_analysis_run_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysis_runs.id"),
        nullable=True,
    )
    related_supplement_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("supplements.id"),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    status: Mapped[str] = mapped_column(String(30), nullable=False, default="received")
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)