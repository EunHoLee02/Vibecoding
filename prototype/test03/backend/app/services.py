from collections import defaultdict

from app.catalog import (
    RISK_REFERENCES,
    SAMPLE_INPUTS,
    TIMING_HINTS,
    infer_sample_id_from_filename,
    normalize_ingredient_name,
)
from app.schemas import (
    AnalysisResult,
    DuplicateIngredientItem,
    RiskItem,
    SampleInputOption,
    SupplementInput,
    TimingGuide,
    UploadParseResult,
)


class PrototypeService:
    def list_sample_inputs(self) -> list[SampleInputOption]:
        return SAMPLE_INPUTS

    def parse_upload_or_sample(
        self,
        sample_id: str | None,
        file_name: str | None,
    ) -> UploadParseResult:
        selected_id = sample_id or infer_sample_id_from_filename(file_name)
        sample = next((item for item in SAMPLE_INPUTS if item.sample_id == selected_id), None)

        if sample is None:
            return UploadParseResult(
                parse_status="failed",
                source_type="sample" if sample_id else "upload",
                supplements=[],
                message="샘플 입력을 찾지 못해 기본 조합을 불러오지 못했습니다.",
            )

        source_type = "sample" if sample_id else "upload"
        supplements = [
            supplement.model_copy(update={"source_type": source_type})
            for supplement in sample.supplements
        ]

        return UploadParseResult(
            parse_status="parsed",
            source_type=source_type,
            supplements=supplements,
            message="샘플 기준 파싱 결과를 불러왔습니다.",
        )

    def build_analysis(self, supplements: list[SupplementInput]) -> AnalysisResult:
        grouped: dict[str, dict] = defaultdict(
            lambda: {
                "product_names": set(),
                "total_amount": 0.0,
                "amount_unit": "",
            }
        )
        timing_guides: list[TimingGuide] = []
        seen_timing: set[str] = set()

        for supplement in supplements:
            for ingredient in supplement.ingredients:
                normalized_name = normalize_ingredient_name(ingredient.ingredient_name)
                grouped[normalized_name]["product_names"].add(supplement.product_name)
                grouped[normalized_name]["total_amount"] += ingredient.amount_value
                grouped[normalized_name]["amount_unit"] = ingredient.amount_unit

                timing_hint = TIMING_HINTS.get(normalized_name)
                if timing_hint and normalized_name not in seen_timing:
                    timing_guides.append(
                        TimingGuide(
                            ingredient_name=normalized_name,
                            recommended_time=timing_hint["recommended_time"],
                            message=timing_hint["message"],
                        )
                    )
                    seen_timing.add(normalized_name)

        duplicated_ingredients: list[DuplicateIngredientItem] = []
        risk_items: list[RiskItem] = []

        for ingredient_name in sorted(grouped.keys()):
            group = grouped[ingredient_name]
            product_names = sorted(group["product_names"])
            total_amount = round(group["total_amount"], 2)
            amount_unit = group["amount_unit"]

            if len(product_names) >= 2:
                duplicated_ingredients.append(
                    DuplicateIngredientItem(
                        ingredient_name=ingredient_name,
                        product_count=len(product_names),
                        product_names=product_names,
                        total_amount=total_amount,
                        amount_unit=amount_unit,
                    )
                )

            reference = RISK_REFERENCES.get(ingredient_name)
            if reference and reference["amount_unit"] == amount_unit:
                if total_amount >= reference["high"]:
                    risk_items.append(
                        RiskItem(
                            ingredient_name=ingredient_name,
                            total_amount=total_amount,
                            reference_amount=reference["high"],
                            amount_unit=amount_unit,
                            risk_level="high",
                            message=f"{ingredient_name} 합산량이 높은 편이라 제품 라벨 기준 복용량을 다시 확인하는 편이 좋습니다.",
                        )
                    )
                elif total_amount >= reference["caution"]:
                    risk_items.append(
                        RiskItem(
                            ingredient_name=ingredient_name,
                            total_amount=total_amount,
                            reference_amount=reference["caution"],
                            amount_unit=amount_unit,
                            risk_level="caution",
                            message=f"{ingredient_name} 합산량이 주의 구간에 가까워 조합을 한 번 더 살펴보는 흐름이 좋습니다.",
                        )
                    )

        return AnalysisResult(
            analysis_status="completed",
            supplements=supplements,
            duplicated_ingredients=duplicated_ingredients,
            risk_items=risk_items,
            timing_guides=timing_guides,
            summary_text=self._build_summary_text(duplicated_ingredients, risk_items),
        )

    def _build_summary_text(
        self,
        duplicated_ingredients: list[DuplicateIngredientItem],
        risk_items: list[RiskItem],
    ) -> str:
        if risk_items:
            return "주의가 필요한 성분이 보여 복용량과 제품 조합을 먼저 다시 확인해 보는 흐름이 좋습니다."
        if duplicated_ingredients:
            return "중복되는 성분이 보여 제품 간 역할이 겹치는지 확인해 보는 것이 좋습니다."
        return "현재 입력 기준으로는 큰 중복 없이 기본 가이드 중심으로 확인할 수 있습니다."
