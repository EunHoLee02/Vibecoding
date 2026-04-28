import hashlib
import json
from datetime import datetime
from decimal import Decimal

from fastapi import status

from app.common.ingredient_catalog import (
    CAUTION_COMBINATIONS,
    INGREDIENT_CATALOG,
    POSITIVE_COMBINATIONS,
    PURPOSE_PROFILES,
    match_ingredient,
)
from app.common.enums import SupplementStatus
from app.core.exceptions import AppException, ErrorCode
from app.db.models.analysis_guide import AnalysisGuide
from app.db.models.analysis_preview import AnalysisPreview
from app.db.models.analysis_purpose_recommendation import (
    AnalysisPurposeRecommendation,
)
from app.db.models.analysis_result_item import AnalysisResultItem
from app.db.models.analysis_run import AnalysisRun
from app.db.repositories.analysis_repository import AnalysisRepository
from app.services.supplement_service import SupplementService

UNIT_CONVERSIONS = {
    ("mg", "mcg"): Decimal("1000"),
    ("mcg", "mg"): Decimal("0.001"),
    ("g", "mg"): Decimal("1000"),
    ("mg", "g"): Decimal("0.001"),
    ("g", "mcg"): Decimal("1000000"),
    ("mcg", "g"): Decimal("0.000001"),
}

SUMMARY_TITLES = {
    "info": "기본 분석이 완료되었습니다.",
    "caution": "일부 성분은 다시 확인하는 편이 좋습니다.",
    "warning": "중복 또는 고함량 성분을 우선 점검해 주세요.",
}

REASON_TITLES = {
    "unit_mismatch": "단위 표기를 다시 확인해 주세요",
    "reference_unit_mismatch": "기준 단위 환산이 필요합니다",
    "duplication_medium": "중복 복용 여부를 확인해 주세요",
    "duplication_high": "중복 복용 가능성이 높습니다",
    "reaches_caution_threshold": "함량이 높은 편입니다",
    "exceeds_upper_limit": "권장 상한을 넘을 수 있습니다",
    "unstandardized_name": "성분명을 한 번 더 확인해 주세요",
}

REASON_MESSAGES = {
    "unit_mismatch": "같은 성분인데 단위 표기가 서로 달라 합산 전에 단위를 다시 확인하는 편이 안전합니다.",
    "reference_unit_mismatch": "기준 데이터와 같은 단위로 바꾸지 못해 수치를 다시 검토할 필요가 있습니다.",
    "duplication_medium": "같은 성분이 2개 제품에서 함께 보여 중복 복용인지 확인해 보세요.",
    "duplication_high": "같은 성분이 여러 제품에 반복되어 과다 복용 위험을 먼저 점검하는 편이 좋습니다.",
    "reaches_caution_threshold": "현재 합산 함량이 주의 구간에 가까워 복용량을 다시 살펴보는 편이 좋습니다.",
    "exceeds_upper_limit": "현재 합산 함량이 권장 상한을 넘을 수 있어 복용량 조정 검토가 필요합니다.",
    "unstandardized_name": "표준 성분명으로 매칭되지 않아 라벨 표기를 다시 확인해 주세요.",
}


class AnalysisService:
    def __init__(self) -> None:
        self.analysis_repo = AnalysisRepository()
        self.supplement_service = SupplementService()

    def _normalize_for_json(self, value):
        if isinstance(value, dict):
            return {key: self._normalize_for_json(item) for key, item in value.items()}
        if isinstance(value, list):
            return [self._normalize_for_json(item) for item in value]
        if isinstance(value, Decimal):
            return str(value)
        return value

    def _normalize_purpose_codes(self, purpose_codes: list[str]) -> list[str]:
        normalized: list[str] = []
        seen: set[str] = set()

        for item in purpose_codes:
            value = item.strip().lower()
            if not value or value in seen:
                continue
            seen.add(value)
            normalized.append(value)

        return normalized

    def _build_fingerprint(self, supplements, purpose_codes: list[str]) -> str:
        normalized = []

        for supplement in sorted(supplements, key=lambda x: str(x.id)):
            normalized.append(
                {
                    "supplement_id": str(supplement.id),
                    "updated_at": supplement.updated_at.isoformat() if supplement.updated_at else None,
                    "ingredients": sorted(
                        [
                            {
                                "ingredient_code": item.ingredient_code,
                                "ingredient_name_standard": item.ingredient_name_standard,
                                "ingredient_name_raw": item.ingredient_name_raw,
                                "amount_value": str(item.amount_value),
                                "amount_unit": item.amount_unit,
                            }
                            for item in supplement.ingredients
                        ],
                        key=lambda item: (
                            item["ingredient_code"] or "",
                            item["ingredient_name_standard"] or "",
                            item["ingredient_name_raw"],
                            item["amount_value"],
                            item["amount_unit"],
                        ),
                    ),
                }
            )

        raw = json.dumps(
            {
                "supplements": normalized,
                "purpose_codes": sorted(self._normalize_purpose_codes(purpose_codes)),
            },
            ensure_ascii=False,
            sort_keys=True,
        )
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()

    def _resolve_reference(self, ingredient) -> dict | None:
        if ingredient.ingredient_code and ingredient.ingredient_code in INGREDIENT_CATALOG:
            return INGREDIENT_CATALOG[ingredient.ingredient_code]

        if ingredient.ingredient_name_standard:
            matched = match_ingredient(ingredient.ingredient_name_standard)
            if matched:
                return matched

        return match_ingredient(ingredient.ingredient_name_raw)

    def _collect_ingredients(self, supplements) -> list[dict]:
        flat_items: list[dict] = []

        for supplement in supplements:
            for ingredient in supplement.ingredients:
                reference = self._resolve_reference(ingredient)
                flat_items.append(
                    {
                        "supplement_id": str(supplement.id),
                        "ingredient_code": ingredient.ingredient_code
                        or (reference["ingredient_code"] if reference else None),
                        "ingredient_name_standard": ingredient.ingredient_name_standard
                        or (reference["standard_name"] if reference else None),
                        "ingredient_name_raw": ingredient.ingredient_name_raw,
                        "amount_value": ingredient.amount_value,
                        "amount_unit": ingredient.amount_unit,
                        "reference": reference,
                    }
                )

        return flat_items

    def _resolve_group_key(self, ingredient: dict) -> tuple[str, str]:
        if ingredient["ingredient_code"]:
            return ("ingredient_code", ingredient["ingredient_code"])
        if ingredient["ingredient_name_standard"]:
            return ("ingredient_name_standard", ingredient["ingredient_name_standard"])
        return ("ingredient_name_raw", ingredient["ingredient_name_raw"])

    def _convert_amount(
        self,
        amount_value: Decimal,
        amount_unit: str,
        target_unit: str,
    ) -> Decimal | None:
        if amount_unit == target_unit:
            return amount_value

        factor = UNIT_CONVERSIONS.get((amount_unit, target_unit))
        if factor is None:
            return None

        return amount_value * factor

    def _group_ingredients(self, flat_ingredients: list[dict]) -> list[dict]:
        grouped: dict[tuple[str, str], dict] = {}

        for ingredient in flat_ingredients:
            group_key = self._resolve_group_key(ingredient)
            display_name = ingredient["ingredient_name_standard"] or ingredient["ingredient_name_raw"]
            amount_unit = ingredient["amount_unit"]
            amount_value = ingredient["amount_value"]

            if group_key not in grouped:
                grouped[group_key] = {
                    "group_type": group_key[0],
                    "group_key": group_key[1],
                    "ingredient_code": ingredient["ingredient_code"],
                    "ingredient_name_standard": display_name,
                    "reference": ingredient["reference"],
                    "total_amount": amount_value,
                    "amount_unit": amount_unit,
                    "duplication_count": 1,
                    "source_supplement_ids": {ingredient["supplement_id"]},
                    "unit_mismatch": False,
                    "review_required": False,
                    "unstandardized": ingredient["ingredient_name_standard"] is None,
                }
                continue

            group = grouped[group_key]
            converted_amount = self._convert_amount(
                amount_value=amount_value,
                amount_unit=amount_unit,
                target_unit=group["amount_unit"],
            )

            if converted_amount is None:
                reverse_amount = self._convert_amount(
                    amount_value=group["total_amount"],
                    amount_unit=group["amount_unit"],
                    target_unit=amount_unit,
                )
                if reverse_amount is None:
                    group["unit_mismatch"] = True
                    group["review_required"] = True
                else:
                    group["total_amount"] = reverse_amount + amount_value
                    group["amount_unit"] = amount_unit
            else:
                group["total_amount"] += converted_amount

            group["duplication_count"] += 1
            group["source_supplement_ids"].add(ingredient["supplement_id"])
            group["unstandardized"] = group["unstandardized"] or (
                ingredient["ingredient_name_standard"] is None
            )

        return list(grouped.values())

    def _evaluate_group(self, grouped_item: dict) -> dict:
        reference = grouped_item["reference"]
        reasons: list[str] = []

        risk_level = "low"
        recommendation_level = "maintain"

        if grouped_item["unit_mismatch"]:
            risk_level = "medium"
            recommendation_level = "review"
            reasons.append("unit_mismatch")
        elif grouped_item["duplication_count"] >= 3:
            risk_level = "high"
            recommendation_level = "reduce"
            reasons.append("duplication_high")
        elif grouped_item["duplication_count"] == 2:
            risk_level = "medium"
            recommendation_level = "review"
            reasons.append("duplication_medium")

        if reference and reference.get("reference_unit"):
            converted_total = self._convert_amount(
                amount_value=grouped_item["total_amount"],
                amount_unit=grouped_item["amount_unit"],
                target_unit=reference["reference_unit"],
            )

            if converted_total is None:
                risk_level = "medium" if risk_level == "low" else risk_level
                recommendation_level = (
                    "review" if recommendation_level == "maintain" else recommendation_level
                )
                reasons.append("reference_unit_mismatch")
            else:
                grouped_item["total_amount"] = converted_total
                grouped_item["amount_unit"] = reference["reference_unit"]

                upper = reference.get("upper")
                caution = reference.get("caution")
                if upper is not None and converted_total > upper:
                    risk_level = "high"
                    recommendation_level = "reduce"
                    reasons.append("exceeds_upper_limit")
                elif caution is not None and converted_total >= caution and risk_level != "high":
                    risk_level = "medium"
                    recommendation_level = (
                        "review" if recommendation_level == "maintain" else recommendation_level
                    )
                    reasons.append("reaches_caution_threshold")

        if grouped_item["unstandardized"]:
            grouped_item["review_required"] = True
            if risk_level == "low":
                risk_level = "medium"
                recommendation_level = "review"
            reasons.append("unstandardized_name")

        if grouped_item["review_required"] and recommendation_level == "maintain":
            recommendation_level = "review"

        return {
            **grouped_item,
            "risk_level": risk_level,
            "recommendation_level": recommendation_level,
            "reasons": reasons,
        }

    def _build_reason_title(self, item: dict) -> str:
        ingredient_name = item["ingredient_name_standard"] or item["group_key"]
        if item["reasons"]:
            return f"{ingredient_name}: {REASON_TITLES.get(item['reasons'][0], '복용 구성을 확인해 주세요')}"
        return f"{ingredient_name}: 복용 구성을 확인해 주세요"

    def _build_reason_message(self, item: dict) -> str:
        parts = [REASON_MESSAGES[reason] for reason in item["reasons"] if reason in REASON_MESSAGES]

        if not parts:
            return "현재 조합을 한 번 더 검토해 보시는 편이 좋습니다."

        if len(parts) == 1:
            return parts[0]

        return " ".join(parts)

    def _build_result_items(self, db, run: AnalysisRun, evaluated_groups: list[dict]) -> None:
        for grouped_item in evaluated_groups:
            result_item = AnalysisResultItem(
                analysis_run_id=run.id,
                ingredient_name_standard=grouped_item["ingredient_name_standard"],
                total_amount=grouped_item["total_amount"],
                amount_unit=grouped_item["amount_unit"],
                duplication_count=grouped_item["duplication_count"],
                risk_level=grouped_item["risk_level"],
                recommendation_level=grouped_item["recommendation_level"],
            )
            self.analysis_repo.create_result_item(db, result_item)

    def _build_guides(self, db, run: AnalysisRun, evaluated_groups: list[dict]) -> None:
        ingredient_codes = {
            item["ingredient_code"]
            for item in evaluated_groups
            if item["ingredient_code"]
        }
        display_order = 1

        for item in evaluated_groups:
            if item["recommendation_level"] not in {"review", "reduce"}:
                continue

            self.analysis_repo.create_guide(
                db,
                AnalysisGuide(
                    analysis_run_id=run.id,
                    guide_type="timing",
                    title=self._build_reason_title(item),
                    content=self._build_reason_message(item),
                    risk_level=item["risk_level"],
                    display_order=display_order,
                ),
            )
            display_order += 1

        for codes, guide_type, title, content, risk_level in POSITIVE_COMBINATIONS + CAUTION_COMBINATIONS:
            if codes.issubset(ingredient_codes):
                self.analysis_repo.create_guide(
                    db,
                    AnalysisGuide(
                        analysis_run_id=run.id,
                        guide_type=guide_type,
                        title=title,
                        content=content,
                        risk_level=risk_level,
                        display_order=display_order,
                    ),
                )
                display_order += 1

    def _build_purpose_recommendations(
        self,
        db,
        run: AnalysisRun,
        evaluated_groups: list[dict],
        purpose_codes: list[str],
    ) -> None:
        ingredient_names_by_code = {
            item["ingredient_code"]: item["ingredient_name_standard"]
            for item in evaluated_groups
            if item["ingredient_code"]
        }
        ingredient_codes = set(ingredient_names_by_code)

        for index, purpose_code in enumerate(purpose_codes, start=1):
            profile = PURPOSE_PROFILES.get(purpose_code)
            if not profile:
                self.analysis_repo.create_purpose_recommendation(
                    db,
                    AnalysisPurposeRecommendation(
                        analysis_run_id=run.id,
                        purpose_code=purpose_code,
                        purpose_title=purpose_code.replace("_", " ").title(),
                        fit_summary="사전에 정의된 목적 프로필이 없어 수동 검토가 필요합니다.",
                        recommendation_level="review",
                        display_order=index,
                    ),
                )
                continue

            matched_codes = ingredient_codes & profile["ingredient_codes"]
            matched_names = [
                ingredient_names_by_code[code]
                for code in sorted(matched_codes)
                if ingredient_names_by_code.get(code)
            ]
            matched_label = ", ".join(matched_names[:3])

            if len(matched_codes) >= 2:
                level = "maintain"
                summary = (
                    f"{profile['title']} 목적과 맞는 성분이 {len(matched_codes)}개 포함되어 있습니다. "
                    f"현재 조합은 {matched_label} 중심으로 방향성이 잘 맞는 편입니다."
                )
            elif len(matched_codes) == 1:
                level = "review"
                summary = (
                    f"{profile['title']} 목적과 직접 맞는 성분은 {matched_label} 1개로 확인됩니다. "
                    "보완이 필요한 성분이 있는지 함께 검토해 보세요."
                )
            else:
                level = "reduce"
                summary = (
                    f"{profile['title']} 목적과 직접 연결되는 성분이 현재 조합에서는 뚜렷하지 않습니다. "
                    "복용 목적에 맞는 제품 구성인지 다시 검토해 보시는 편이 좋습니다."
                )

            self.analysis_repo.create_purpose_recommendation(
                db,
                AnalysisPurposeRecommendation(
                    analysis_run_id=run.id,
                    purpose_code=purpose_code,
                    purpose_title=profile["title"],
                    fit_summary=summary,
                    recommendation_level=level,
                    display_order=index,
                ),
            )

    def _build_summary(self, supplements, evaluated_groups: list[dict]) -> dict:
        supplement_count = len(supplements)
        grouped_count = len(evaluated_groups)
        duplicated_count = sum(1 for item in evaluated_groups if item["duplication_count"] > 1)
        caution_count = sum(1 for item in evaluated_groups if item["risk_level"] in {"medium", "high"})
        high_count = sum(1 for item in evaluated_groups if item["risk_level"] == "high")
        review_count = sum(1 for item in evaluated_groups if item["recommendation_level"] == "review")

        if high_count > 0:
            summary_level = "warning"
        elif caution_count > 0 or review_count > 0:
            summary_level = "caution"
        else:
            summary_level = "info"

        summary_title = SUMMARY_TITLES[summary_level]
        summary_message = (
            f"{supplement_count}개의 영양제에서 {grouped_count}개 성분 그룹을 분석했습니다. "
            f"중복 성분 {duplicated_count}건, 주의가 필요한 성분 {caution_count}건이 확인되었습니다."
        )
        if review_count > 0:
            summary_message += f" 다시 확인을 권장하는 항목은 {review_count}건입니다."

        return {
            "summary_level": summary_level,
            "summary_title": summary_title,
            "summary_message": summary_message,
        }

    def _execute_analysis_run(self, db, run: AnalysisRun, supplements, purpose_codes: list[str]) -> AnalysisRun:
        flat_ingredients = self._collect_ingredients(supplements)
        grouped_ingredients = self._group_ingredients(flat_ingredients)
        evaluated_groups = [self._evaluate_group(grouped_item) for grouped_item in grouped_ingredients]

        self._build_result_items(db, run, evaluated_groups)
        self._build_guides(db, run, evaluated_groups)
        self._build_purpose_recommendations(db, run, evaluated_groups, purpose_codes)
        summary = self._build_summary(supplements, evaluated_groups)

        run.status = "completed"
        run.summary_level = summary["summary_level"]
        run.summary_title = summary["summary_title"]
        run.summary_message = summary["summary_message"]
        run.completed_at = datetime.utcnow()
        return run

    def create_preview(self, db, user_id, payload):
        supplements = [
            self.supplement_service.get_supplement(db, user_id, supplement_id)
            for supplement_id in payload.supplement_ids
        ]

        invalid_items = []
        warning_items = []
        preview_list = []

        for supplement in supplements:
            if supplement.deleted_at is not None:
                invalid_items.append({"supplement_id": str(supplement.id), "reason": "deleted"})

            if supplement.status == SupplementStatus.ANALYSIS_LOCKED:
                invalid_items.append({"supplement_id": str(supplement.id), "reason": "analysis_locked"})

            if not supplement.ingredients:
                invalid_items.append({"supplement_id": str(supplement.id), "reason": "ingredient_missing"})

            unmatched_count = sum(
                1
                for item in supplement.ingredients
                if item.match_status and item.match_status.value == "unmatched"
            )
            if unmatched_count > 0:
                warning_items.append(
                    {
                        "supplement_id": str(supplement.id),
                        "reason": "unmatched_ingredients",
                        "count": unmatched_count,
                    }
                )

            preview_list.append(
                {
                    "supplement_id": str(supplement.id),
                    "product_name": supplement.product_name,
                    "manufacturer": supplement.manufacturer,
                    "serving_basis_type": supplement.serving_basis_type.value,
                    "daily_serving_count": (
                        str(supplement.daily_serving_count)
                        if supplement.daily_serving_count is not None
                        else None
                    ),
                    "ingredient_count": len(supplement.ingredients),
                    "unmatched_ingredient_count": unmatched_count,
                }
            )

        ready_for_analysis = len(invalid_items) == 0
        preview_status = "ready" if ready_for_analysis else "invalid"
        normalized_purpose_codes = self._normalize_purpose_codes(payload.purpose_codes)

        preview_payload = self._normalize_for_json(
            {
                "supplement_ids": [str(item.id) for item in supplements],
                "purpose_codes": normalized_purpose_codes,
                "supplement_preview_list": preview_list,
            }
        )
        validation_summary = self._normalize_for_json(
            {
                "invalid_items": invalid_items,
                "warning_items": warning_items,
                "valid_count": len(supplements) - len(invalid_items),
            }
        )

        preview = AnalysisPreview(
            user_id=user_id,
            preview_payload=preview_payload,
            validation_summary=validation_summary,
            ready_for_analysis=ready_for_analysis,
            preview_status=preview_status,
        )

        self.analysis_repo.create_preview(db, preview)
        db.commit()
        db.refresh(preview)
        return preview

    def create_analysis(self, db, user_id, payload):
        try:
            preview = self.analysis_repo.get_preview_by_id(
                db=db,
                preview_id=payload.confirmed_preview_id,
                user_id=user_id,
            )
            if not preview:
                raise AppException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    code=ErrorCode.NOT_FOUND,
                    message="Analysis preview was not found.",
                )

            if not preview.ready_for_analysis:
                raise AppException(
                    status_code=status.HTTP_409_CONFLICT,
                    code=ErrorCode.CONFLICT,
                    message="Analysis preview is not ready.",
                )

            supplements = [
                self.supplement_service.get_supplement(db, user_id, supplement_id)
                for supplement_id in payload.supplement_ids
            ]
            normalized_purpose_codes = self._normalize_purpose_codes(payload.purpose_codes)
            fingerprint = self._build_fingerprint(supplements, normalized_purpose_codes)

            reused = self.analysis_repo.get_reusable_run(
                db=db,
                user_id=user_id,
                fingerprint=fingerprint,
            )
            if reused:
                reused.is_reused_result = True
                reused.reuse_reason = "same_fingerprint"
                db.commit()
                db.refresh(reused)
                return reused

            run = AnalysisRun(
                user_id=user_id,
                confirmed_preview_id=payload.confirmed_preview_id,
                status="pending",
                fingerprint=fingerprint,
                purpose_codes=normalized_purpose_codes,
                is_reused_result=False,
                reuse_reason=None,
            )
            self.analysis_repo.create_run(db, run)
            self._execute_analysis_run(db, run, supplements, normalized_purpose_codes)

            db.commit()
            db.refresh(run)
            return run
        except Exception:
            db.rollback()
            raise

    def list_analysis_runs(self, db, user_id):
        return self.analysis_repo.list_runs(db=db, user_id=user_id)

    def get_analysis_status(self, db, user_id, run_id):
        run = self.analysis_repo.get_run_by_id(db, run_id, user_id)
        if not run:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code=ErrorCode.NOT_FOUND,
                message="Analysis run was not found.",
            )
        return run

    def get_analysis_result(self, db, user_id, run_id):
        run = self.get_analysis_status(db, user_id, run_id)

        if run.status not in {"completed", "partial_completed"}:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="Analysis result is not ready yet.",
            )

        result_items = self.analysis_repo.get_result_items(db, run_id)
        guides = self.analysis_repo.get_guides(db, run_id)
        purpose_recommendations = self.analysis_repo.get_purpose_recommendations(db, run_id)
        return run, result_items, guides, purpose_recommendations
