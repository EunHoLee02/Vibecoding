from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps.auth import require_roles
from app.common.responses import success_response
from app.db.session import get_db
from app.schemas.auth import CurrentPrincipalData
from app.schemas.inquiry import (
    AdminInquiryListItem,
    AdminInquiryUpdateNoteRequest,
    AdminInquiryUpdateStatusRequest,
    InquiryResponse,
)
from app.services.inquiry_service import InquiryService

router = APIRouter(prefix="/api/v1/admin/inquiries", tags=["admin-inquiries"])
service = InquiryService()


@router.get("", status_code=status.HTTP_200_OK)
def list_admin_inquiries(
    db: Session = Depends(get_db),
    principal: CurrentPrincipalData = Depends(require_roles("admin")),
):
    items = service.list_admin_inquiries(db=db)
    return success_response(
        data=[
            AdminInquiryListItem(
                id=item.id,
                user_id=item.user_id,
                inquiry_type=item.inquiry_type,
                title=item.title,
                status=item.status,
                created_at=item.created_at.isoformat(),
            ).model_dump()
            for item in items
        ]
    )


@router.patch("/{inquiry_id}/status", status_code=status.HTTP_200_OK)
def update_inquiry_status(
    inquiry_id,
    payload: AdminInquiryUpdateStatusRequest,
    request: Request,
    db: Session = Depends(get_db),
    principal: CurrentPrincipalData = Depends(require_roles("admin")),
):
    inquiry = service.update_inquiry_status(
        db=db,
        admin_user_id=principal.user_id,
        inquiry_id=inquiry_id,
        payload=payload,
        request_id=getattr(request.state, "request_id", None),
    )
    return success_response(data=InquiryResponse.model_validate(inquiry).model_dump())


@router.patch("/{inquiry_id}/note", status_code=status.HTTP_200_OK)
def update_inquiry_note(
    inquiry_id,
    payload: AdminInquiryUpdateNoteRequest,
    request: Request,
    db: Session = Depends(get_db),
    principal: CurrentPrincipalData = Depends(require_roles("admin")),
):
    inquiry = service.update_inquiry_note(
        db=db,
        admin_user_id=principal.user_id,
        inquiry_id=inquiry_id,
        payload=payload,
        request_id=getattr(request.state, "request_id", None),
    )
    return success_response(data=InquiryResponse.model_validate(inquiry).model_dump())
