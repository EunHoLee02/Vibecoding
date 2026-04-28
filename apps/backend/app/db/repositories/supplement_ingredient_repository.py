from app.common.ingredient_catalog import standardize_ingredient_payload
from app.db.models.supplement_ingredient import SupplementIngredient


class SupplementIngredientRepository:
    def replace_all(self, db, supplement, ingredients_payload: list[dict]) -> None:
        supplement.ingredients.clear()

        for item in ingredients_payload:
            normalized_item = standardize_ingredient_payload(item)
            supplement.ingredients.append(
                SupplementIngredient(
                    ingredient_name_raw=normalized_item["ingredient_name_raw"],
                    ingredient_name_standard=normalized_item["ingredient_name_standard"],
                    ingredient_code=normalized_item["ingredient_code"],
                    amount_value=normalized_item["amount_value"],
                    amount_unit=normalized_item["amount_unit"],
                    is_primary_display_value=normalized_item.get("is_primary_display_value", False),
                    match_status=normalized_item["match_status"],
                )
            )

        db.flush()
