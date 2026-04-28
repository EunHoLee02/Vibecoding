from collections import defaultdict
from uuid import uuid4

from app.catalog import CAUTION_COMBINATIONS, INGREDIENT_CATALOG, SAMPLE_PAYLOADS, convert_amount, find_catalog_item
from app.schemas import (
    AnalysisResult,
    DuplicateIngredient,
    OverLimitIngredient,
    SamplePayload,
    SupplementInput,
    TimingGuide,
)


class PrototypeService:
    def list_samples(self) -> list[SamplePayload]:
        return [SamplePayload.model_validate(payload) for payload in SAMPLE_PAYLOADS.values()]

    def parse_stub_payload(self, sample_id: str | None, file_name: str | None) -> dict:
        selected = sample_id
        if not selected and file_name:
            lowered = file_name.lower()
            if "immune" in lowered or "zinc" in lowered:
                selected = "immune_focus"
            else:
                selected = "daily_core"

        if not selected:
            selected = "daily_core"

        payload = SAMPLE_PAYLOADS.get(selected)
        if payload is None:
            payload = SAMPLE_PAYLOADS["daily_core"]

        return {
            "source_type": "sample_upload",
            "sample_id": payload["sample_id"],
            "supplements": payload["supplements"],
        }

    def build_analysis(self, supplements: list[SupplementInput]) -> AnalysisResult:
        grouped: dict[str, dict] = defaultdict(
            lambda: {
                "ingredient_code": "",
                "ingredient_name": "",
                "supplement_names": set(),
                "total_amount": 0.0,
                "amount_unit": "",
                "caution_amount": None,
                "upper_amount": None,
            }
        )
        timing_guides: list[TimingGuide] = []

        for supplement in supplements:
            for ingredient in supplement.ingredients:
                catalog_item = find_catalog_item(ingredient.ingredient_name_raw)
                if catalog_item is None:
                    continue

                ingredient_code = next(
                    key
                    for key, value in INGREDIENT_CATALOG.items()
                    if value["standard_name"] == catalog_item["standard_name"]
                )
                reference_unit = catalog_item["reference_unit"]
                converted = convert_amount(ingredient.amount_value, ingredient.amount_unit, reference_unit)
                if converted is None:
                    continue

                group = grouped[ingredient_code]
                group["ingredient_code"] = ingredient_code
                group["ingredient_name"] = catalog_item["standard_name"]
                group["supplement_names"].add(supplement.supplement_name)
                group["total_amount"] += converted * supplement.daily_servings
                group["amount_unit"] = reference_unit
                group["caution_amount"] = catalog_item["caution_amount"]
                group["upper_amount"] = catalog_item["upper_amount"]

                if not any(item.title == catalog_item["standard_name"] for item in timing_guides):
                    timing_guides.append(
                        TimingGuide(
                            title=catalog_item["standard_name"],
                            guidance=catalog_item["timing_hint"],
                            severity="low",
                        )
                    )

        duplicate_ingredients: list[DuplicateIngredient] = []
        over_limit_ingredients: list[OverLimitIngredient] = []

        for ingredient_code, group in grouped.items():
            supplement_count = len(group["supplement_names"])
            total_amount = round(group["total_amount"], 2)

            if supplement_count >= 2:
                severity = "high" if supplement_count >= 3 else "medium"
                duplicate_ingredients.append(
                    DuplicateIngredient(
                        ingredient_code=ingredient_code,
                        ingredient_name=group["ingredient_name"],
                        supplement_count=supplement_count,
                        total_amount=total_amount,
                        amount_unit=group["amount_unit"],
                        severity=severity,
                        message=f"{group['ingredient_name']} 성분이 {supplement_count}개 제품에 함께 보여 중복 복용 여부를 확인하는 편이 좋습니다.",
                    )
                )

            upper_amount = group["upper_amount"]
            caution_amount = group["caution_amount"]
            if upper_amount is not None and total_amount > upper_amount:
                over_limit_ingredients.append(
                    OverLimitIngredient(
                        ingredient_code=ingredient_code,
                        ingredient_name=group["ingredient_name"],
                        total_amount=total_amount,
                        caution_amount=caution_amount or upper_amount,
                        upper_amount=upper_amount,
                        amount_unit=group["amount_unit"],
                        severity="high",
                        message=f"{group['ingredient_name']} 합산량이 일반 가이드 상한을 넘을 수 있어 라벨 기준 복용량 재확인이 필요합니다.",
                    )
                )
            elif caution_amount is not None and total_amount >= caution_amount:
                over_limit_ingredients.append(
                    OverLimitIngredient(
                        ingredient_code=ingredient_code,
                        ingredient_name=group["ingredient_name"],
                        total_amount=total_amount,
                        caution_amount=caution_amount,
                        upper_amount=upper_amount or caution_amount,
                        amount_unit=group["amount_unit"],
                        severity="medium",
                        message=f"{group['ingredient_name']} 합산량이 높은 편이라 용량과 제품 중복 여부를 검토하는 편이 좋습니다.",
                    )
                )

        for combination in CAUTION_COMBINATIONS:
            if combination["ingredient_codes"].issubset(set(grouped.keys())):
                timing_guides.append(
                    TimingGuide(
                        title=combination["title"],
                        guidance=combination["guidance"],
                        severity=combination["severity"],
                    )
                )

        summary_line = self._build_summary_line(duplicate_ingredients, over_limit_ingredients)

        return AnalysisResult(
            analysis_id=str(uuid4()),
            status="completed",
            summary_line=summary_line,
            supplements=supplements,
            duplicate_ingredients=duplicate_ingredients,
            over_limit_ingredients=over_limit_ingredients,
            timing_guides=timing_guides[:6],
        )

    def _build_summary_line(
        self,
        duplicate_ingredients: list[DuplicateIngredient],
        over_limit_ingredients: list[OverLimitIngredient],
    ) -> str:
        if over_limit_ingredients:
            return "고함량 또는 상한 검토가 필요한 성분이 있어 먼저 복용량을 다시 확인해 보세요."
        if duplicate_ingredients:
            return "중복 성분이 보여 제품 조합을 한 번 더 검토하는 흐름이 좋습니다."
        return "현재 입력 기준으로는 큰 중복 없이 기본 가이드 중심으로 확인할 수 있습니다."
