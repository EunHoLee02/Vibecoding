from datetime import datetime
from uuid import uuid4

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Numeric, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.enums import IngredientMatchStatus
from app.db.base import Base

ENUM_VALUE_OPTIONS = {
    "native_enum": False,
    "values_callable": lambda enum_cls: [item.value for item in enum_cls],
}


class SupplementIngredient(Base):
    __tablename__ = "supplement_ingredients"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    supplement_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("supplements.id"),
        nullable=False,
    )

    ingredient_name_raw: Mapped[str] = mapped_column(String(200), nullable=False)
    ingredient_name_standard: Mapped[str | None] = mapped_column(String(200), nullable=True)
    ingredient_code: Mapped[str | None] = mapped_column(String(100), nullable=True)

    amount_value: Mapped[float] = mapped_column(Numeric(12, 4), nullable=False)
    amount_unit: Mapped[str] = mapped_column(String(50), nullable=False)

    is_primary_display_value: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    match_status: Mapped[IngredientMatchStatus] = mapped_column(
        SAEnum(
            IngredientMatchStatus,
            name="ingredient_match_status",
            **ENUM_VALUE_OPTIONS,
        ),
        nullable=False,
        default=IngredientMatchStatus.UNMATCHED,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    supplement = relationship("Supplement", back_populates="ingredients")
