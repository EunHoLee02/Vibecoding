from datetime import datetime

from app.db.session import SessionLocal
from app.db.repositories.ocr_repository import OcrRepository
from app.integrations.ocr.engine import OcrEngine


def run_ocr_job(ocr_job_id):
    db = SessionLocal()
    repo = OcrRepository()
    engine = OcrEngine()

    try:
        job = repo.get_by_id_any_owner(db, ocr_job_id)
        if not job:
            return

        # commit 이후 expired 객체 재조회 문제를 피하려고
        # OCR에 필요한 값은 미리 로컬 변수로 빼둠
        source_file_key = job.source_file_key

        job.status = "processing"
        job.started_at = datetime.utcnow()
        db.commit()

        # 오래 걸릴 수 있는 외부 작업
        payload = engine.extract_from_object(source_file_key)

        job = repo.get_by_id_any_owner(db, ocr_job_id)
        if not job:
            return

        job.extracted_payload = payload
        job.status = "succeeded"
        job.completed_at = datetime.utcnow()
        job.error_code = None
        job.error_message = None
        db.commit()

    except Exception as exc:
        db.rollback()

        try:
            job = repo.get_by_id_any_owner(db, ocr_job_id)
            if job:
                job.status = "failed"
                job.error_code = "OCR_JOB_FAILED"
                job.error_message = str(exc)
                job.retry_count = (job.retry_count or 0) + 1
                db.commit()
        except Exception:
            db.rollback()
            raise

    finally:
        db.close()
