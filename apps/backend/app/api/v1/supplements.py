from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_principal
from app.common.responses import success_response
from app.db.session import get_db
from app.schemas.supplement import (
    SupplementCreateRequest,
    SupplementResponse,
    SupplementUpdateRequest,
    SupplementListItem,
)
from app.services.supplement_service import SupplementService

router = APIRouter(prefix="/api/v1/supplements", tags=["supplements"])

service = SupplementService()


@router.get("", status_code=status.HTTP_200_OK)
def list_supplements(
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    items = service.list_supplements(db=db, user_id=principal.user_id)
    return success_response(
        data=[SupplementListItem.model_validate(item).model_dump() for item in items]
    )


@router.get("/{supplement_id}", status_code=status.HTTP_200_OK)
def get_supplement(
    supplement_id,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    supplement = service.get_supplement(db=db, user_id=principal.user_id, supplement_id=supplement_id)
    return success_response(
        data=SupplementResponse.model_validate(supplement).model_dump()
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_manual_supplement(
    payload: SupplementCreateRequest,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    supplement = service.create_manual_supplement(db=db, user_id=principal.user_id, payload=payload)
    return success_response(
        data=SupplementResponse.model_validate(supplement).model_dump()
    )


@router.patch("/{supplement_id}", status_code=status.HTTP_200_OK)
def update_supplement(
    supplement_id,
    payload: SupplementUpdateRequest,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    supplement = service.update_supplement(
        db=db,
        user_id=principal.user_id,
        supplement_id=supplement_id,
        payload=payload,
    )
    return success_response(
        data=SupplementResponse.model_validate(supplement).model_dump()
    )


@router.delete("/{supplement_id}", status_code=status.HTTP_200_OK)
def delete_supplement(
    supplement_id,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    supplement = service.delete_supplement(
        db=db,
        user_id=principal.user_id,
        supplement_id=supplement_id,
    )
    return success_response(
        data={
            "id": str(supplement.id),
            "status": supplement.status.value,
            "deleted_at": supplement.deleted_at.isoformat() if supplement.deleted_at else None,
        }
    )


@router.post("/{supplement_id}/restore", status_code=status.HTTP_200_OK)
def restore_supplement(
    supplement_id,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    supplement = service.restore_supplement(
        db=db,
        user_id=principal.user_id,
        supplement_id=supplement_id,
    )
    return success_response(
        data={
            "id": str(supplement.id),
            "status": supplement.status.value,
            "deleted_at": None,
        }
    )