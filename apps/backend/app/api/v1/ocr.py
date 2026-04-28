from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_principal
from app.common.responses import success_response
from app.db.session import get_db
from app.schemas.ocr import (
    OcrConfirmRequest,
    OcrJobStatusResponse,
    OcrUploadCompleteRequest,
    OcrUploadUrlRequest,
    OcrUploadUrlResponse,
)
from app.schemas.supplement import SupplementResponse
from app.services.ocr_service import OcrService

router = APIRouter(prefix="/api/v1/ocr", tags=["ocr"])
service = OcrService()


@router.post("/upload-url", status_code=status.HTTP_201_CREATED)
def create_ocr_upload_url(
    payload: OcrUploadUrlRequest,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    job, upload_url, object_key = service.create_upload_url(
        db=db,
        user_id=principal.user_id,
        payload=payload,
    )
    response = OcrUploadUrlResponse(
        ocr_job_id=job.id,
        upload_url=upload_url,
        object_key=object_key,
    )
    return success_response(data=response.model_dump())


@router.put("/jobs/{ocr_job_id}/file", status_code=status.HTTP_200_OK)
async def upload_ocr_source_file(
    ocr_job_id,
    request: Request,
    db: Session = Depends(get_db),
):
    content = await request.body()
    job = service.upload_source_file(
        db=db,
        ocr_job_id=ocr_job_id,
        content_type=request.headers.get("content-type"),
        content=content,
    )
    return success_response(
        data={
            "ocr_job_id": str(job.id),
            "uploaded": True,
        }
    )


@router.post("/jobs/{ocr_job_id}/complete", status_code=status.HTTP_200_OK)
def complete_ocr_upload(
    ocr_job_id,
    payload: OcrUploadCompleteRequest,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    job = service.complete_upload(
        db=db,
        user_id=principal.user_id,
        ocr_job_id=ocr_job_id,
        payload=payload,
    )
    return success_response(
        data={
            "ocr_job_id": str(job.id),
            "status": job.status,
        }
    )


@router.get("/jobs/{ocr_job_id}", status_code=status.HTTP_200_OK)
def get_ocr_job_status(
    ocr_job_id,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    job = service.get_job_status(
        db=db,
        user_id=principal.user_id,
        ocr_job_id=ocr_job_id,
    )
    response = OcrJobStatusResponse(
        ocr_job_id=job.id,
        status=job.status,
        extracted_payload=job.extracted_payload,
        error_code=job.error_code,
        error_message=job.error_message,
        retry_count=job.retry_count,
    )
    return success_response(data=response.model_dump())


@router.post("/jobs/{ocr_job_id}/confirm", status_code=status.HTTP_201_CREATED)
def confirm_ocr_result(
    ocr_job_id,
    payload: OcrConfirmRequest,
    db: Session = Depends(get_db),
    principal=Depends(get_current_principal),
):
    job, supplement = service.confirm_ocr_result(
        db=db,
        user_id=principal.user_id,
        ocr_job_id=ocr_job_id,
        payload=payload,
    )
    return success_response(
        data={
            "ocr_job_id": str(job.id),
            "supplement": SupplementResponse.model_validate(supplement).model_dump(),
        }
    )
