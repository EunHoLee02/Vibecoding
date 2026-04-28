from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    confirmed_preview_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysis_previews.id"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    fingerprint: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose_codes: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    is_reused_result: Mapped[bool] = mapped_column(nullable=False, default=False)
    reuse_reason: Mapped[str | None] = mapped_column(String(50), nullable=True)

    summary_level: Mapped[str | None] = mapped_column(String(30), nullable=True)
    summary_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    summary_message: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)