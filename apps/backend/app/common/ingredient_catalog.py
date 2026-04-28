from decimal import Decimal

from app.common.enums import IngredientMatchStatus


INGREDIENT_CATALOG = {
    "vitamin_c": {
        "standard_name": "Vitamin C",
        "ingredient_code": "vitamin_c",
        "aliases": ["vitamin c", "비타민c", "비타민 c", "ascorbic acid"],
        "reference_unit": "mg",
        "caution": Decimal("1000"),
        "upper": Decimal("2000"),
    },
    "zinc": {
        "standard_name": "Zinc",
        "ingredient_code": "zinc",
        "aliases": ["zinc", "아연"],
        "reference_unit": "mg",
        "caution": Decimal("25"),
        "upper": Decimal("40"),
    },
    "vitamin_d": {
        "standard_name": "Vitamin D",
        "ingredient_code": "vitamin_d",
        "aliases": ["vitamin d", "비타민d", "비타민 d", "vitamin d3"],
        "reference_unit": "mcg",
        "caution": Decimal("75"),
        "upper": Decimal("100"),
    },
    "magnesium": {
        "standard_name": "Magnesium",
        "ingredient_code": "magnesium",
        "aliases": ["magnesium", "마그네슘"],
        "reference_unit": "mg",
        "caution": Decimal("250"),
        "upper": Decimal("350"),
    },
    "omega_3": {
        "standard_name": "Omega 3",
        "ingredient_code": "omega_3",
        "aliases": ["omega 3", "omega-3", "오메가3", "epa", "dha"],
        "reference_unit": "mg",
        "caution": Decimal("2000"),
        "upper": Decimal("3000"),
    },
    "probiotics": {
        "standard_name": "Probiotics",
        "ingredient_code": "probiotics",
        "aliases": ["probiotics", "유산균", "lactobacillus"],
        "reference_unit": "CFU",
        "caution": None,
        "upper": None,
    },
    "iron": {
        "standard_name": "Iron",
        "ingredient_code": "iron",
        "aliases": ["iron", "철", "ferrous"],
        "reference_unit": "mg",
        "caution": Decimal("30"),
        "upper": Decimal("45"),
    },
    "calcium": {
        "standard_name": "Calcium",
        "ingredient_code": "calcium",
        "aliases": ["calcium", "칼슘"],
        "reference_unit": "mg",
        "caution": Decimal("1000"),
        "upper": Decimal("2000"),
    },
    "lutein": {
        "standard_name": "Lutein",
        "ingredient_code": "lutein",
        "aliases": ["lutein", "루테인"],
        "reference_unit": "mg",
        "caution": None,
        "upper": None,
    },
    "vitamin_b12": {
        "standard_name": "Vitamin B12",
        "ingredient_code": "vitamin_b12",
        "aliases": ["vitamin b12", "비타민b12", "비타민 b12", "cobalamin"],
        "reference_unit": "mcg",
        "caution": None,
        "upper": None,
    },
}

PURPOSE_PROFILES = {
    "immunity": {
        "title": "면역 케어",
        "ingredient_codes": {"vitamin_c", "zinc", "vitamin_d", "probiotics"},
    },
    "fatigue": {
        "title": "피로 관리",
        "ingredient_codes": {"magnesium", "iron", "vitamin_b12", "vitamin_c"},
    },
    "bone": {
        "title": "뼈 건강",
        "ingredient_codes": {"calcium", "vitamin_d", "magnesium"},
    },
    "eye": {
        "title": "눈 건강",
        "ingredient_codes": {"lutein", "omega_3", "vitamin_c"},
    },
}

POSITIVE_COMBINATIONS = [
    (
        {"vitamin_d", "calcium"},
        "positive_combination",
        "Vitamin D + Calcium",
        "칼슘과 비타민 D 조합은 뼈 건강 목적에서 함께 언급되는 대표 조합입니다.",
        "low",
    ),
    (
        {"omega_3", "lutein"},
        "positive_combination",
        "Omega 3 + Lutein",
        "오메가3와 루테인은 눈 건강 목적에서 함께 검토하기 좋은 조합입니다.",
        "low",
    ),
]

CAUTION_COMBINATIONS = [
    (
        {"iron", "calcium"},
        "caution_combination",
        "Iron + Calcium timing",
        "철분과 칼슘은 같은 시간대 복용 시 흡수 효율이 떨어질 수 있어 시간차를 두는 편이 좋습니다.",
        "medium",
    ),
    (
        {"magnesium", "zinc"},
        "timing",
        "Magnesium + Zinc review",
        "마그네슘과 아연은 함께 섭취되는 경우가 많지만, 고함량 중복 여부는 다시 확인하는 편이 안전합니다.",
        "medium",
    ),
]


def normalize_ingredient_name(value: str) -> str:
    return "".join(ch.lower() for ch in value if ch.isalnum())


def match_ingredient(name: str) -> dict | None:
    normalized = normalize_ingredient_name(name)

    for item in INGREDIENT_CATALOG.values():
        for alias in item["aliases"]:
            if normalize_ingredient_name(alias) == normalized:
                return item

    return None


def standardize_ingredient_payload(item: dict) -> dict:
    matched = match_ingredient(item["ingredient_name_raw"])
    if not matched:
        return {
            **item,
            "ingredient_name_standard": None,
            "ingredient_code": None,
            "match_status": IngredientMatchStatus.UNMATCHED,
        }

    return {
        **item,
        "ingredient_name_standard": matched["standard_name"],
        "ingredient_code": matched["ingredient_code"],
        "match_status": IngredientMatchStatus.MATCHED,
    }
