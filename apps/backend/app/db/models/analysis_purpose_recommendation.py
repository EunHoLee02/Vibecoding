from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AnalysisPurposeRecommendation(Base):
    __tablename__ = "analysis_purpose_recommendations"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    analysis_run_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysis_runs.id"),
        nullable=False,
    )
    purpose_code: Mapped[str] = mapped_column(String(100), nullable=False)
    purpose_title: Mapped[str] = mapped_column(String(200), nullable=False)
    fit_summary: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation_level: Mapped[str] = mapped_column(String(30), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
