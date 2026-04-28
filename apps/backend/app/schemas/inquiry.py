from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class InquiryCreateRequest(BaseModel):
    inquiry_type: str = Field(min_length=1, max_length=30)
    related_analysis_run_id: UUID | None = None
    related_supplement_id: UUID | None = None
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)

    @field_validator("inquiry_type", "title", "content")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()


class InquiryResponse(BaseModel):
    id: UUID
    inquiry_type: str
    related_analysis_run_id: UUID | None = None
    related_supplement_id: UUID | None = None
    title: str
    content: str
    status: str
    admin_note: str | None = None

    class Config:
        from_attributes = True


class AdminInquiryListItem(BaseModel):
    id: UUID
    user_id: UUID
    inquiry_type: str
    title: str
    status: str
    created_at: str

    class Config:
        from_attributes = True


class AdminInquiryUpdateStatusRequest(BaseModel):
    status: str = Field(min_length=1, max_length=30)
    reason: str | None = None

    @field_validator("status")
    @classmethod
    def normalize_status(cls, value: str) -> str:
        return value.strip().lower()


class AdminInquiryUpdateNoteRequest(BaseModel):
    admin_note: str | None = None
    reason: str | None = None