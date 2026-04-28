from datetime import datetime

from fastapi import status

from app.common.enums import SupplementSourceType, SupplementStatus
from app.core.exceptions import AppException, ErrorCode
from app.db.models.supplement import Supplement
from app.db.models.supplement_ocr_job import SupplementOcrJob
from app.db.repositories.ocr_repository import OcrRepository
from app.db.repositories.supplement_ingredient_repository import (
    SupplementIngredientRepository,
)
from app.db.repositories.supplement_repository import SupplementRepository
from app.integrations.r2.client import R2Client
from app.worker.tasks.ocr_tasks import run_ocr_job


ALLOWED_OCR_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
}


class OcrService:
    def __init__(self) -> None:
        self.ocr_repo = OcrRepository()
        self.supplement_repo = SupplementRepository()
        self.ingredient_repo = SupplementIngredientRepository()
        self.r2_client = R2Client()

    def create_upload_url(self, db, user_id, payload):
        if payload.mime_type not in ALLOWED_OCR_MIME_TYPES:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code=ErrorCode.INVALID_INPUT,
                message="지원하지 않는 파일 형식입니다.",
                detail={"field": "mime_type"},
            )

        object_key = self.r2_client.build_object_key(
            user_id=user_id,
            file_name=payload.file_name,
        )

        job = SupplementOcrJob(
            user_id=user_id,
            status="uploaded",
            source_file_key=object_key,
            source_file_name=payload.file_name,
            source_mime_type=payload.mime_type,
            source_file_size_bytes=payload.file_size_bytes,
        )
        self.ocr_repo.create(db, job)
        db.commit()
        db.refresh(job)

        upload_url = self.r2_client.create_presigned_upload_url(
            object_key=object_key,
            mime_type=payload.mime_type,
            ocr_job_id=str(job.id),
        )

        return job, upload_url, object_key

    def upload_source_file(self, db, ocr_job_id, content_type: str | None, content: bytes):
        job = self.ocr_repo.get_by_id_any_owner(db=db, ocr_job_id=ocr_job_id)
        if not job:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code=ErrorCode.NOT_FOUND,
                message="OCR 작업을 찾을 수 없습니다.",
            )

        if job.status not in {"uploaded", "failed"}:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="현재 상태에서는 파일 업로드를 받을 수 없습니다.",
            )

        if not content:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code=ErrorCode.INVALID_INPUT,
                message="업로드할 파일 본문이 비어 있습니다.",
            )

        if content_type and content_type != job.source_mime_type:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code=ErrorCode.INVALID_INPUT,
                message="업로드 파일의 MIME 타입이 요청 정보와 일치하지 않습니다.",
                detail={
                    "expected": job.source_mime_type,
                    "received": content_type,
                },
            )

        self.r2_client.upload_object(job.source_file_key, content)
        return job

    def complete_upload(self, db, user_id, ocr_job_id, payload):
        job = self.ocr_repo.get_by_id(db=db, ocr_job_id=ocr_job_id, user_id=user_id)
        if not job:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code=ErrorCode.NOT_FOUND,
                message="OCR 작업을 찾을 수 없습니다.",
            )

        if job.status not in {"uploaded", "failed"}:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="업로드 완료 처리가 가능한 상태가 아닙니다.",
            )

        if not payload.uploaded:
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code=ErrorCode.INVALID_INPUT,
                message="업로드 완료 여부가 올바르지 않습니다.",
            )

        if not self.r2_client.object_exists(job.source_file_key):
            raise AppException(
                status_code=status.HTTP_400_BAD_REQUEST,
                code=ErrorCode.INVALID_INPUT,
                message="업로드된 원본 파일을 찾을 수 없습니다.",
            )

        job.status = "queued"
        db.commit()
        db.refresh(job)

        run_ocr_job(job.id)
        db.refresh(job)
        return job

    def get_job_status(self, db, user_id, ocr_job_id):
        job = self.ocr_repo.get_by_id(db=db, ocr_job_id=ocr_job_id, user_id=user_id)
        if not job:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code=ErrorCode.NOT_FOUND,
                message="OCR 작업을 찾을 수 없습니다.",
            )
        return job

    def confirm_ocr_result(self, db, user_id, ocr_job_id, payload):
        job = self.ocr_repo.get_by_id(db=db, ocr_job_id=ocr_job_id, user_id=user_id)
        if not job:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code=ErrorCode.NOT_FOUND,
                message="OCR 작업을 찾을 수 없습니다.",
            )

        if job.status != "succeeded":
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="검수 확정 가능한 OCR 상태가 아닙니다.",
            )

        supplement = Supplement(
            user_id=user_id,
            source_type=SupplementSourceType.OCR,
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

        job.linked_supplement_id = supplement.id
        job.status = "confirmed"

        self.r2_client.delete_object(job.source_file_key)
        job.source_deleted_at = datetime.utcnow()

        db.commit()
        db.refresh(job)
        db.refresh(supplement)
        return job, supplement
