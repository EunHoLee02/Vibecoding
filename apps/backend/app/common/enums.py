from enum import Enum


class SupplementSourceType(str, Enum):
    MANUAL = "manual"
    OCR = "ocr"
    HYBRID = "hybrid"


class SupplementStatus(str, Enum):
    ACTIVE = "active"
    ANALYZABLE = "analyzable"
    ANALYSIS_LOCKED = "analysis_locked"
    ARCHIVED = "archived"
    DELETED = "deleted"


class ServingBasisType(str, Enum):
    PER_SERVING = "per_serving"
    PER_DAY = "per_day"


class IngredientMatchStatus(str, Enum):
    MATCHED = "matched"
    PARTIAL_MATCHED = "partial_matched"
    UNMATCHED = "unmatched"