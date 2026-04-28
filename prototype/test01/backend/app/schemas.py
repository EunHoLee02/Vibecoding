from typing import Literal

from pydantic import BaseModel, Field


AmountUnit = Literal["mg", "mcg", "CFU"]
SourceType = Literal["manual", "sample_upload"]
AnalysisStatus = Literal["completed"]
SeverityLowToHigh = Literal["low", "medium", "high"]
SeverityMediumHigh = Literal["medium", "high"]


class IngredientInput(BaseModel):
    ingredient_name_raw: str = Field(min_length=1)
    amount_value: float = Field(gt=0)
    amount_unit: AmountUnit


class SupplementInput(BaseModel):
    supplement_name: str = Field(min_length=1)
    daily_servings: int = Field(ge=1, le=10)
    source_type: SourceType
    ingredients: list[IngredientInput] = Field(min_length=1, max_length=12)


class ParseStubRequest(BaseModel):
    sample_id: str | None = None
    file_name: str | None = None


class DuplicateIngredient(BaseModel):
    ingredient_code: str
    ingredient_name: str
    supplement_count: int
    total_amount: float
    amount_unit: str
    severity: SeverityLowToHigh
    message: str


class OverLimitIngredient(BaseModel):
    ingredient_code: str
    ingredient_name: str
    total_amount: float
    caution_amount: float
    upper_amount: float
    amount_unit: str
    severity: SeverityMediumHigh
    message: str


class TimingGuide(BaseModel):
    title: str
    guidance: str
    severity: Literal["low", "medium"]


class AnalysisResult(BaseModel):
    analysis_id: str
    status: AnalysisStatus
    summary_line: str
    supplements: list[SupplementInput]
    duplicate_ingredients: list[DuplicateIngredient]
    over_limit_ingredients: list[OverLimitIngredient]
    timing_guides: list[TimingGuide]


class SamplePayload(BaseModel):
    sample_id: str
    title: str
    description: str
    supplements: list[SupplementInput]


class AnalyzeRequest(BaseModel):
    supplements: list[SupplementInput] = Field(min_length=1, max_length=6)
