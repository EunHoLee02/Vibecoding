from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.supplement_ocr_job import SupplementOcrJob


class OcrRepository:
    def create(self, db: Session, job: SupplementOcrJob) -> SupplementOcrJob:
        db.add(job)
        db.flush()
        db.refresh(job)
        return job

    def get_by_id(self, db: Session, ocr_job_id, user_id) -> SupplementOcrJob | None:
        stmt = select(SupplementOcrJob).where(
            SupplementOcrJob.id == ocr_job_id,
            SupplementOcrJob.user_id == user_id,
        )
        return db.scalar(stmt)

    def get_by_id_any_owner(self, db: Session, ocr_job_id) -> SupplementOcrJob | None:
        stmt = select(SupplementOcrJob).where(SupplementOcrJob.id == ocr_job_id)
        return db.scalar(stmt)