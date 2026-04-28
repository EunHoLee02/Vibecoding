from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class AnalysisPreviewRequest(BaseModel):
    supplement_ids: list[UUID] = Field(min_length=1)
    purpose_codes: list[str] = Field(default_factory=list)


class AnalysisPreviewResponse(BaseModel):
    id: UUID
    supplement_preview_list: list[dict]
    validation_summary: dict
    ready_for_analysis: bool
    preview_status: str

    class Config:
        from_attributes = True


class AnalysisCreateRequest(BaseModel):
    confirmed_preview_id: UUID
    supplement_ids: list[UUID] = Field(min_length=1)
    purpose_codes: list[str] = Field(default_factory=list)


class AnalysisCreateResponse(BaseModel):
    analysis_run_id: UUID
    analysis_status: str
    is_reused_result: bool
    reuse_reason: str | None = None


class AnalysisStatusResponse(BaseModel):
    analysis_run_id: UUID
    analysis_status: str
    is_reused_result: bool
    reuse_reason: str | None = None
    completed_at: str | None = None


class AnalysisHistoryItemResponse(BaseModel):
    analysis_run_id: UUID
    analysis_status: str
    summary_level: str | None = None
    summary_title: str | None = None
    is_reused_result: bool
    created_at: str
    completed_at: str | None = None


class AnalysisResultItemResponse(BaseModel):
    ingredient_name_standard: str
    total_amount: Decimal
    amount_unit: str
    duplication_count: int
    risk_level: str
    recommendation_level: str

    class Config:
        from_attributes = True


class AnalysisGuideResponse(BaseModel):
    guide_type: str
    title: str
    content: str
    risk_level: str | None = None
    display_order: int

    class Config:
        from_attributes = True


class AnalysisPurposeRecommendationResponse(BaseModel):
    purpose_code: str
    purpose_title: str
    fit_summary: str
    recommendation_level: str
    display_order: int

    class Config:
        from_attributes = True


class AnalysisResultResponse(BaseModel):
    analysis_run_id: UUID
    analysis_status: str
    summary_level: str | None = None
    summary_title: str | None = None
    summary_message: str | None = None
    result_items: list[AnalysisResultItemResponse]
    guides: list[AnalysisGuideResponse] = Field(default_factory=list)
    purpose_recommendations: list[AnalysisPurposeRecommendationResponse] = Field(
        default_factory=list
    )

    class Config:
        from_attributes = True
