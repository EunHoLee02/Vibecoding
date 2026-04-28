from fastapi import status

from app.common.enums import SupplementSourceType, SupplementStatus
from app.core.exceptions import AppException, ErrorCode
from app.db.models.supplement import Supplement
from app.db.repositories.supplement_repository import SupplementRepository
from app.db.repositories.supplement_ingredient_repository import SupplementIngredientRepository


class SupplementService:
    def __init__(self) -> None:
        self.supplement_repo = SupplementRepository()
        self.ingredient_repo = SupplementIngredientRepository()

    def list_supplements(self, db, user_id):
        return self.supplement_repo.get_list(db=db, user_id=user_id)

    def get_supplement(self, db, user_id, supplement_id):
        supplement = self.supplement_repo.get_by_id(db=db, supplement_id=supplement_id, user_id=user_id)
        if not supplement:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code=ErrorCode.NOT_FOUND,
                message="영양제를 찾을 수 없습니다.",
            )
        return supplement

    def create_manual_supplement(self, db, user_id, payload):
        supplement = Supplement(
            user_id=user_id,
            source_type=SupplementSourceType.MANUAL,
            product_name=payload.product_name,
            manufacturer=payload.manufacturer,
            serving_basis_type=payload.serving_basis_type,
            daily_serving_count=payload.daily_serving_count,
            memo=payload.memo,
            status=SupplementStatus.ACTIVE,
        )
        self.supplement_repo.create(db, supplement)
        self.ingredient_repo.replace_all(
            db=db,
            supplement=supplement,
            ingredients_payload=[item.model_dump() for item in payload.ingredient_list],
        )
        db.commit()
        db.refresh(supplement)
        return supplement

    def update_supplement(self, db, user_id, supplement_id, payload):
        supplement = self.get_supplement(db, user_id, supplement_id)

        if supplement.deleted_at is not None:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="삭제된 영양제는 수정할 수 없습니다.",
            )

        if supplement.status == SupplementStatus.ANALYSIS_LOCKED:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="분석 중인 영양제는 수정할 수 없습니다.",
            )

        if payload.product_name is not None:
            supplement.product_name = payload.product_name
        if payload.manufacturer is not None:
            supplement.manufacturer = payload.manufacturer
        if payload.serving_basis_type is not None:
            supplement.serving_basis_type = payload.serving_basis_type
        if payload.daily_serving_count is not None:
            supplement.daily_serving_count = payload.daily_serving_count
        if payload.memo is not None:
            supplement.memo = payload.memo
        if payload.ingredient_list is not None:
            self.ingredient_repo.replace_all(
                db=db,
                supplement=supplement,
                ingredients_payload=[item.model_dump() for item in payload.ingredient_list],
            )

        db.commit()
        db.refresh(supplement)
        return supplement

    def delete_supplement(self, db, user_id, supplement_id):
        supplement = self.get_supplement(db, user_id, supplement_id)

        if supplement.deleted_at is not None:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="이미 삭제된 영양제입니다.",
            )

        if supplement.status == SupplementStatus.ANALYSIS_LOCKED:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="분석 중인 영양제는 삭제할 수 없습니다.",
            )

        self.supplement_repo.soft_delete(db, supplement)
        db.commit()
        return supplement

    def restore_supplement(self, db, user_id, supplement_id):
        supplement = self.get_supplement(db, user_id, supplement_id)

        if supplement.deleted_at is None:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="삭제된 영양제만 복구할 수 있습니다.",
            )

        self.supplement_repo.restore(db, supplement)
        db.commit()
        db.refresh(supplement)
        return supplement
