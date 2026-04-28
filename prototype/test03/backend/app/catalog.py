from app.schemas import SampleInputOption


SAMPLE_INPUTS = [
    SampleInputOption(
        sample_id="daily_balance",
        title="Daily Balance Pack",
        description="비타민C, 마그네슘, 오메가3 중심의 기본 조합 샘플",
        supplements=[
            {
                "product_name": "Morning C Plus",
                "manufacturer": "Well Labs",
                "source_type": "sample",
                "ingredients": [
                    {"ingredient_name": "Vitamin C", "amount_value": 500, "amount_unit": "mg"},
                    {"ingredient_name": "Zinc", "amount_value": 8, "amount_unit": "mg"},
                ],
            },
            {
                "product_name": "Omega Daily",
                "manufacturer": "Nutri Coast",
                "source_type": "sample",
                "ingredients": [
                    {"ingredient_name": "Omega-3", "amount_value": 900, "amount_unit": "mg"},
                    {"ingredient_name": "Vitamin D", "amount_value": 1000, "amount_unit": "IU"},
                ],
            },
        ],
    ),
    SampleInputOption(
        sample_id="immune_focus",
        title="Immune Focus Pack",
        description="비타민C와 아연이 여러 제품에 함께 들어가는 중복 확인 샘플",
        supplements=[
            {
                "product_name": "Immune Shot",
                "manufacturer": "Better Day",
                "source_type": "sample",
                "ingredients": [
                    {"ingredient_name": "Vitamin C", "amount_value": 1000, "amount_unit": "mg"},
                    {"ingredient_name": "Zinc", "amount_value": 15, "amount_unit": "mg"},
                ],
            },
            {
                "product_name": "Daily Multi",
                "manufacturer": "Better Day",
                "source_type": "sample",
                "ingredients": [
                    {"ingredient_name": "Vitamin C", "amount_value": 300, "amount_unit": "mg"},
                    {"ingredient_name": "Zinc", "amount_value": 10, "amount_unit": "mg"},
                    {"ingredient_name": "Vitamin D", "amount_value": 2000, "amount_unit": "IU"},
                ],
            },
        ],
    ),
    SampleInputOption(
        sample_id="sleep_support",
        title="Sleep Support Pack",
        description="마그네슘과 프로바이오틱스 중심의 저녁 가이드 샘플",
        supplements=[
            {
                "product_name": "Calm Night Magnesium",
                "manufacturer": "Rest Formula",
                "source_type": "sample",
                "ingredients": [
                    {"ingredient_name": "Magnesium", "amount_value": 350, "amount_unit": "mg"},
                ],
            },
            {
                "product_name": "Daily Biotics",
                "manufacturer": "Rest Formula",
                "source_type": "sample",
                "ingredients": [
                    {"ingredient_name": "Probiotics", "amount_value": 1000000000, "amount_unit": "CFU"},
                ],
            },
        ],
    ),
]


INGREDIENT_ALIASES = {
    "vitamin c": "Vitamin C",
    "ascorbic acid": "Vitamin C",
    "zinc": "Zinc",
    "vitamin d": "Vitamin D",
    "vitamin d3": "Vitamin D",
    "magnesium": "Magnesium",
    "omega-3": "Omega-3",
    "omega 3": "Omega-3",
    "epa+dha": "Omega-3",
    "probiotics": "Probiotics",
    "lactic acid bacteria": "Probiotics",
}


RISK_REFERENCES = {
    "Vitamin C": {"amount_unit": "mg", "caution": 1000, "high": 2000},
    "Zinc": {"amount_unit": "mg", "caution": 20, "high": 40},
    "Vitamin D": {"amount_unit": "IU", "caution": 2000, "high": 4000},
    "Magnesium": {"amount_unit": "mg", "caution": 350, "high": 500},
    "Omega-3": {"amount_unit": "mg", "caution": 2000, "high": 3000},
    "Probiotics": {"amount_unit": "CFU", "caution": 1000000000, "high": 10000000000},
}


TIMING_HINTS = {
    "Vitamin C": {
        "recommended_time": "morning",
        "message": "일반적으로 아침이나 낮 시간대에 나누어 확인하는 흐름이 무난합니다.",
    },
    "Zinc": {
        "recommended_time": "with_meal",
        "message": "공복보다 식사와 함께 확인하는 편이 부담을 줄이는 데 도움이 될 수 있습니다.",
    },
    "Vitamin D": {
        "recommended_time": "with_meal",
        "message": "지방이 포함된 식사와 함께 확인하는 흐름이 일반적인 가이드에 가깝습니다.",
    },
    "Magnesium": {
        "recommended_time": "evening",
        "message": "저녁 시간대에 확인하는 사용자가 많지만, 제품 라벨 기준을 먼저 보는 편이 좋습니다.",
    },
    "Omega-3": {
        "recommended_time": "with_meal",
        "message": "식사와 함께 확인하면 일반적인 복용 흐름을 만들기 쉽습니다.",
    },
    "Probiotics": {
        "recommended_time": "empty_stomach",
        "message": "공복 또는 제품 권장 시점에 맞춰 확인하는 흐름이 자주 사용됩니다.",
    },
}


def infer_sample_id_from_filename(file_name: str | None) -> str:
    lowered = (file_name or "").lower()
    if "immune" in lowered or "zinc" in lowered:
        return "immune_focus"
    if "sleep" in lowered or "magnesium" in lowered or "night" in lowered:
        return "sleep_support"
    return "daily_balance"


def normalize_ingredient_name(name: str) -> str:
    return INGREDIENT_ALIASES.get(name.strip().lower(), name.strip())
