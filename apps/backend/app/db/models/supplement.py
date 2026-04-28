from datetime import datetime
from decimal import Decimal
from uuid import uuid4

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.common.enums import SupplementSourceType, SupplementStatus, ServingBasisType
from app.db.base import Base

ENUM_VALUE_OPTIONS = {
    "native_enum": False,
    "values_callable": lambda enum_cls: [item.value for item in enum_cls],
}


class Supplement(Base):
    __tablename__ = "supplements"

    id: Mapped[str] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[str] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    source_type: Mapped[SupplementSourceType] = mapped_column(
        SAEnum(
            SupplementSourceType,
            name="supplement_source_type",
            **ENUM_VALUE_OPTIONS,
        ),
        nullable=False,
        default=SupplementSourceType.MANUAL,
    )
    product_name: Mapped[str] = mapped_column(String(200), nullable=False)
    manufacturer: Mapped[str | None] = mapped_column(String(200), nullable=True)
    serving_basis_type: Mapped[ServingBasisType] = mapped_column(
        SAEnum(
            ServingBasisType,
            name="serving_basis_type",
            **ENUM_VALUE_OPTIONS,
        ),
        nullable=False,
    )
    daily_serving_count: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    memo: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[SupplementStatus] = mapped_column(
        SAEnum(
            SupplementStatus,
            name="supplement_status",
            **ENUM_VALUE_OPTIONS,
        ),
        nullable=False,
        default=SupplementStatus.ACTIVE,
    )

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    ingredients = relationship(
        "SupplementIngredient",
        back_populates="supplement",
        cascade="all, delete-orphan",
    )
