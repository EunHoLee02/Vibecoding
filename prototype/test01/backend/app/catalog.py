INGREDIENT_CATALOG = {
    "vitamin_c": {
        "standard_name": "Vitamin C",
        "aliases": ["vitamin c", "비타민c", "비타민 c", "ascorbic acid"],
        "reference_unit": "mg",
        "caution_amount": 1000,
        "upper_amount": 2000,
        "timing_hint": "아침이나 점심 식후에 가볍게 나누어 섭취하는 흐름이 무난합니다.",
    },
    "zinc": {
        "standard_name": "Zinc",
        "aliases": ["zinc", "아연"],
        "reference_unit": "mg",
        "caution_amount": 25,
        "upper_amount": 40,
        "timing_hint": "공복에 불편할 수 있어 식후 섭취 가이드로 보는 편이 좋습니다.",
    },
    "vitamin_d": {
        "standard_name": "Vitamin D",
        "aliases": ["vitamin d", "비타민d", "비타민 d", "vitamin d3"],
        "reference_unit": "mcg",
        "caution_amount": 75,
        "upper_amount": 100,
        "timing_hint": "지방이 있는 식사와 함께 복용하는 흐름이 일반적인 가이드에 가깝습니다.",
    },
    "magnesium": {
        "standard_name": "Magnesium",
        "aliases": ["magnesium", "마그네슘"],
        "reference_unit": "mg",
        "caution_amount": 250,
        "upper_amount": 350,
        "timing_hint": "저녁 시간대에 검토하는 경우가 많지만 제품 라벨 기준을 우선 확인하세요.",
    },
    "omega_3": {
        "standard_name": "Omega 3",
        "aliases": ["omega 3", "omega-3", "오메가3", "epa", "dha"],
        "reference_unit": "mg",
        "caution_amount": 2000,
        "upper_amount": 3000,
        "timing_hint": "식사와 함께 복용하는 기본 가이드로 정리할 수 있습니다.",
    },
    "iron": {
        "standard_name": "Iron",
        "aliases": ["iron", "철", "ferrous"],
        "reference_unit": "mg",
        "caution_amount": 30,
        "upper_amount": 45,
        "timing_hint": "칼슘과는 시간차를 두는 가이드를 함께 확인하는 편이 좋습니다.",
    },
    "calcium": {
        "standard_name": "Calcium",
        "aliases": ["calcium", "칼슘"],
        "reference_unit": "mg",
        "caution_amount": 1000,
        "upper_amount": 2000,
        "timing_hint": "철분과는 같은 시간대 복용을 피하는 일반 가이드가 자주 함께 언급됩니다.",
    },
}

UNIT_CONVERSIONS = {
    ("mg", "mcg"): 1000.0,
    ("mcg", "mg"): 0.001,
}

SAMPLE_PAYLOADS = {
    "daily_core": {
        "sample_id": "daily_core",
        "title": "데일리 기본 조합",
        "description": "비타민C, 비타민D, 마그네슘 중심의 기본 데모 샘플",
        "supplements": [
            {
                "supplement_name": "Morning Daily",
                "daily_servings": 1,
                "source_type": "sample_upload",
                "ingredients": [
                    {"ingredient_name_raw": "Vitamin C", "amount_value": 500, "amount_unit": "mg"},
                    {"ingredient_name_raw": "Vitamin D", "amount_value": 25, "amount_unit": "mcg"},
                ],
            },
            {
                "supplement_name": "Night Mineral",
                "daily_servings": 1,
                "source_type": "sample_upload",
                "ingredients": [
                    {"ingredient_name_raw": "Magnesium", "amount_value": 300, "amount_unit": "mg"},
                    {"ingredient_name_raw": "Zinc", "amount_value": 15, "amount_unit": "mg"},
                ],
            },
        ],
    },
    "immune_focus": {
        "sample_id": "immune_focus",
        "title": "면역 집중 조합",
        "description": "비타민C와 아연 중복을 빠르게 시연하는 샘플",
        "supplements": [
            {
                "supplement_name": "Immunity Shot",
                "daily_servings": 1,
                "source_type": "sample_upload",
                "ingredients": [
                    {"ingredient_name_raw": "Vitamin C", "amount_value": 1000, "amount_unit": "mg"},
                    {"ingredient_name_raw": "Zinc", "amount_value": 25, "amount_unit": "mg"},
                ],
            },
            {
                "supplement_name": "Mineral Boost",
                "daily_servings": 1,
                "source_type": "sample_upload",
                "ingredients": [
                    {"ingredient_name_raw": "Vitamin C", "amount_value": 500, "amount_unit": "mg"},
                    {"ingredient_name_raw": "Zinc", "amount_value": 20, "amount_unit": "mg"},
                ],
            },
        ],
    },
}

CAUTION_COMBINATIONS = [
    {
        "ingredient_codes": {"iron", "calcium"},
        "title": "Iron + Calcium timing",
        "guidance": "철분과 칼슘은 같은 시간대보다 시간차를 두는 일반 가이드가 더 자주 언급됩니다.",
        "severity": "medium",
    },
    {
        "ingredient_codes": {"magnesium", "zinc"},
        "title": "Magnesium + Zinc review",
        "guidance": "마그네슘과 아연은 함께 복용하는 경우가 있지만 고함량 중복 여부는 한 번 더 확인하는 편이 좋습니다.",
        "severity": "medium",
    },
]


def normalize_name(value: str) -> str:
    return "".join(ch.lower() for ch in value if ch.isalnum())


def find_catalog_item(name: str) -> dict | None:
    normalized = normalize_name(name)
    for item in INGREDIENT_CATALOG.values():
        for alias in item["aliases"]:
            if normalize_name(alias) == normalized:
                return item
    return None


def convert_amount(amount_value: float, amount_unit: str, target_unit: str) -> float | None:
    if amount_unit == target_unit:
        return amount_value
    factor = UNIT_CONVERSIONS.get((amount_unit, target_unit))
    if factor is None:
        return None
    return amount_value * factor
