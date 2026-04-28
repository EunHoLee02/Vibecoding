from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.common.enums import (
    IngredientMatchStatus,
    ServingBasisType,
    SupplementSourceType,
    SupplementStatus,
)


class SupplementIngredientBase(BaseModel):
    ingredient_name_raw: str = Field(min_length=1, max_length=200)
    amount_value: Decimal = Field(gt=0)
    amount_unit: str = Field(min_length=1, max_length=50)
    is_primary_display_value: bool = False

    @field_validator("ingredient_name_raw", "amount_unit")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class SupplementIngredientCreate(SupplementIngredientBase):
    pass


class SupplementIngredientResponse(SupplementIngredientBase):
    id: UUID
    ingredient_name_standard: str | None = None
    ingredient_code: str | None = None
    match_status: IngredientMatchStatus

    class Config:
        from_attributes = True


class SupplementCreateRequest(BaseModel):
    product_name: str = Field(min_length=1, max_length=200)
    manufacturer: str | None = Field(default=None, max_length=200)
    serving_basis_type: ServingBasisType
    daily_serving_count: Decimal | None = Field(default=None, gt=0)
    memo: str | None = None
    ingredient_list: list[SupplementIngredientCreate] = Field(min_length=1)

    @field_validator("product_name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        return value.strip()


class SupplementUpdateRequest(BaseModel):
    product_name: str | None = Field(default=None, min_length=1, max_length=200)
    manufacturer: str | None = Field(default=None, max_length=200)
    serving_basis_type: ServingBasisType | None = None
    daily_serving_count: Decimal | None = Field(default=None, gt=0)
    memo: str | None = None
    ingredient_list: list[SupplementIngredientCreate] | None = None


class SupplementResponse(BaseModel):
    id: UUID
    source_type: SupplementSourceType
    product_name: str
    manufacturer: str | None = None
    serving_basis_type: ServingBasisType
    daily_serving_count: Decimal | None = None
    memo: str | None = None
    status: SupplementStatus
    deleted_at: str | None = None
    ingredients: list[SupplementIngredientResponse]

    class Config:
        from_attributes = True


class SupplementListItem(BaseModel):
    id: UUID
    product_name: str
    manufacturer: str | None = None
    source_type: SupplementSourceType
    status: SupplementStatus

    class Config:
        from_attributes = True