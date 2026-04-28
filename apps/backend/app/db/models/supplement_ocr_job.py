from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class SupplementOcrJob(Base):
    __tablename__ = "supplement_ocr_jobs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    linked_supplement_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("supplements.id"),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(String(30), nullable=False, default="uploaded")

    source_file_key: Mapped[str] = mapped_column(String(500), nullable=False)
    source_file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    source_file_size_bytes: Mapped[int] = mapped_column(nullable=False)

    extracted_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    error_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    source_deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)