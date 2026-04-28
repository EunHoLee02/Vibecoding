from datetime import datetime

from fastapi import status

from app.core.exceptions import AppException, ErrorCode
from app.db.models.admin_action_log import AdminActionLog
from app.db.models.inquiry import Inquiry
from app.db.repositories.admin_action_log_repository import AdminActionLogRepository
from app.db.repositories.analysis_repository import AnalysisRepository
from app.db.repositories.inquiry_repository import InquiryRepository
from app.db.repositories.supplement_repository import SupplementRepository


ALLOWED_INQUIRY_TYPES = {
    "general",
    "error_report",
    "analysis",
    "supplement",
    "account",
}

ALLOWED_INQUIRY_STATUSES = {
    "received",
    "in_progress",
    "resolved",
    "closed",
}


class InquiryService:
    def __init__(self) -> None:
        self.inquiry_repo = InquiryRepository()
        self.analysis_repo = AnalysisRepository()
        self.supplement_repo = SupplementRepository()
        self.admin_log_repo = AdminActionLogRepository()

    def create_inquiry(self, db, user_id, payload):
        inquiry_type = payload.inquiry_type.lower()
        if inquiry_type not in ALLOWED_INQUIRY_TYPES:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code=ErrorCode.INVALID_INPUT,
                message="허용되지 않은 문의 유형입니다.",
                detail={"field": "inquiry_type"},
            )

        if payload.related_analysis_run_id:
            analysis_run = self.analysis_repo.get_run_by_id(
                db=db,
                run_id=payload.related_analysis_run_id,
                user_id=user_id,
            )
            if not analysis_run:
                raise AppException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    code=ErrorCode.NOT_FOUND,
                    message="관련 분석 정보를 찾을 수 없습니다.",
                )

        if payload.related_supplement_id:
            supplement = self.supplement_repo.get_by_id(
                db=db,
                supplement_id=payload.related_supplement_id,
                user_id=user_id,
            )
            if not supplement:
                raise AppException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    code=ErrorCode.NOT_FOUND,
                    message="관련 영양제를 찾을 수 없습니다.",
                )

        inquiry = Inquiry(
            user_id=user_id,
            inquiry_type=inquiry_type,
            related_analysis_run_id=payload.related_analysis_run_id,
            related_supplement_id=payload.related_supplement_id,
            title=payload.title,
            content=payload.content,
            status="received",
        )

        self.inquiry_repo.create(db, inquiry)
        db.commit()
        db.refresh(inquiry)
        return inquiry

    def list_user_inquiries(self, db, user_id):
        return self.inquiry_repo.get_user_list(db=db, user_id=user_id)

    def list_admin_inquiries(self, db):
        return self.inquiry_repo.get_admin_list(db=db)

    def update_inquiry_status(self, db, admin_user_id, inquiry_id, payload, request_id=None):
        inquiry = self.inquiry_repo.get_by_id(db, inquiry_id)
        if not inquiry:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code=ErrorCode.NOT_FOUND,
                message="문의를 찾을 수 없습니다.",
            )

        new_status = payload.status.lower()
        if new_status not in ALLOWED_INQUIRY_STATUSES:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code=ErrorCode.INVALID_INPUT,
                message="허용되지 않은 문의 상태입니다.",
                detail={"field": "status"},
            )

        before_data = {
            "status": inquiry.status,
            "admin_note": inquiry.admin_note,
            "resolved_at": inquiry.resolved_at.isoformat() if inquiry.resolved_at else None,
        }

        inquiry.status = new_status
        if new_status in {"resolved", "closed"}:
            inquiry.resolved_at = datetime.utcnow()

        after_data = {
            "status": inquiry.status,
            "admin_note": inquiry.admin_note,
            "resolved_at": inquiry.resolved_at.isoformat() if inquiry.resolved_at else None,
        }

        self.admin_log_repo.create(
            db,
            AdminActionLog(
                admin_user_id=admin_user_id,
                action_type="INQUIRY_STATUS_CHANGED",
                target_type="inquiry",
                target_id=inquiry.id,
                reason=payload.reason,
                before_json=before_data,
                after_json=after_data,
                request_id=request_id,
            ),
        )

        db.commit()
        db.refresh(inquiry)
        return inquiry

    def update_inquiry_note(self, db, admin_user_id, inquiry_id, payload, request_id=None):
        inquiry = self.inquiry_repo.get_by_id(db, inquiry_id)
        if not inquiry:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code=ErrorCode.NOT_FOUND,
                message="문의를 찾을 수 없습니다.",
            )

        before_data = {
            "admin_note": inquiry.admin_note,
        }

        inquiry.admin_note = payload.admin_note

        after_data = {
            "admin_note": inquiry.admin_note,
        }

        self.admin_log_repo.create(
            db,
            AdminActionLog(
                admin_user_id=admin_user_id,
                action_type="INQUIRY_NOTE_UPDATED",
                target_type="inquiry",
                target_id=inquiry.id,
                reason=payload.reason,
                before_json=before_data,
                after_json=after_data,
                request_id=request_id,
            ),
        )

        db.commit()
        db.refresh(inquiry)
        return inquiry