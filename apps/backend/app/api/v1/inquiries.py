from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_principal
from app.common.responses import success_response
from app.db.session import get_db
from app.schemas.inquiry import InquiryCreateRequest, InquiryResponse
from app.services.inquiry_service import InquiryService

router = APIRouter(prefix="/api/v1/inquiries", tags=["inquiries"])
service = InquiryService()


@router.get("", status_code=status.HTTP_200_OK)
def list_my_inquiries(
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    items = service.list_user_inquiries(db=db, user_id=principal.user_id)
    return success_response(
        data=[InquiryResponse.model_validate(item).model_dump() for item in items]
    )


@router.post("", status_code=status.HTTP_201_CREATED)
def create_inquiry(
    payload: InquiryCreateRequest,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    inquiry = service.create_inquiry(db=db, user_id=principal.user_id, payload=payload)
    return success_response(
        data=InquiryResponse.model_validate(inquiry).model_dump()
    )