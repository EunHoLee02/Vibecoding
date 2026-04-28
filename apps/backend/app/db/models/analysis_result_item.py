from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Numeric, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AnalysisResultItem(Base):
    __tablename__ = "analysis_result_items"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    analysis_run_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("analysis_runs.id"),
        nullable=False,
    )

    ingredient_name_standard: Mapped[str] = mapped_column(String(200), nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    amount_unit: Mapped[str] = mapped_column(String(50), nullable=False)

    duplication_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    risk_level: Mapped[str] = mapped_column(String(30), nullable=False)
    recommendation_level: Mapped[str] = mapped_column(String(30), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)