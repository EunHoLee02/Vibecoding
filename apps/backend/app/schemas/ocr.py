from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.common.enums import ServingBasisType
from app.schemas.supplement import SupplementIngredientCreate, SupplementResponse


class OcrUploadUrlRequest(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    mime_type: str = Field(min_length=1, max_length=100)
    file_size_bytes: int = Field(gt=0, le=30 * 1024 * 1024)

    @field_validator("file_name", "mime_type")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class OcrUploadUrlResponse(BaseModel):
    ocr_job_id: UUID
    upload_url: str
    object_key: str


class OcrUploadCompleteRequest(BaseModel):
    uploaded: bool = True


class OcrJobStatusResponse(BaseModel):
    ocr_job_id: UUID
    status: str
    extracted_payload: dict | None = None
    error_code: str | None = None
    error_message: str | None = None
    retry_count: int

    class Config:
        from_attributes = True


class OcrConfirmRequest(BaseModel):
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


class OcrConfirmResponse(BaseModel):
    ocr_job_id: UUID
    supplement: SupplementResponse