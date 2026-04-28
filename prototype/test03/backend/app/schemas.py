from typing import Literal

from pydantic import BaseModel, Field


AmountUnit = Literal["mg", "mcg", "IU", "CFU"]
SourceType = Literal["manual", "upload", "sample"]
ParseStatus = Literal["parsed", "failed"]
AnalysisStatus = Literal["completed", "failed"]
RiskLevel = Literal["caution", "high"]
RecommendedTime = Literal[
    "morning",
    "afternoon",
    "evening",
    "with_meal",
    "empty_stomach",
    "anytime",
]


class IngredientItem(BaseModel):
    ingredient_name: str = Field(min_length=1)
    amount_value: float = Field(gt=0)
    amount_unit: AmountUnit


class SupplementInput(BaseModel):
    product_name: str = Field(min_length=1)
    manufacturer: str | None = None
    source_type: SourceType
    ingredients: list[IngredientItem] = Field(min_length=1, max_length=20)


class SampleInputOption(BaseModel):
    sample_id: str
    title: str
    description: str
    supplements: list[SupplementInput]


class UploadParseResult(BaseModel):
    parse_status: ParseStatus
    source_type: Literal["upload", "sample"]
    supplements: list[SupplementInput]
    message: str | None = None


class AnalysisRequest(BaseModel):
    supplements: list[SupplementInput] = Field(min_length=1, max_length=8)


class DuplicateIngredientItem(BaseModel):
    ingredient_name: str
    product_count: int = Field(ge=2)
    product_names: list[str] = Field(min_length=2)
    total_amount: float = Field(ge=0)
    amount_unit: str


class RiskItem(BaseModel):
    ingredient_name: str
    total_amount: float = Field(ge=0)
    reference_amount: float = Field(gt=0)
    amount_unit: str
    risk_level: RiskLevel
    message: str


class TimingGuide(BaseModel):
    ingredient_name: str
    recommended_time: RecommendedTime
    message: str


class AnalysisResult(BaseModel):
    analysis_status: AnalysisStatus
    supplements: list[SupplementInput]
    duplicated_ingredients: list[DuplicateIngredientItem]
    risk_items: list[RiskItem]
    timing_guides: list[TimingGuide]
    summary_text: str


class ErrorDetail(BaseModel):
    code: str
    message: str


class SuccessEnvelope(BaseModel):
    success: Literal[True]
    data: dict
    error: None = None


class ErrorEnvelope(BaseModel):
    success: Literal[False]
    data: None = None
    error: ErrorDetail
