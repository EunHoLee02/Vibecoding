from pathlib import Path

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.redis_client import get_redis_client
from app.db.session import get_db

router = APIRouter(tags=["health"])


@router.get("/health/live", status_code=status.HTTP_200_OK)
def health_live():
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
    }


@router.get("/health/ready", status_code=status.HTTP_200_OK)
def health_ready(db: Session = Depends(get_db)):
    settings = get_settings()
    checks: dict[str, str] = {}

    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception:
        checks["database"] = "error"

    try:
        get_redis_client().ping()
        checks["redis"] = "ok"
    except Exception:
        checks["redis"] = "error"

    try:
        storage_root = Path(__file__).resolve().parents[3] / settings.LOCAL_STORAGE_DIR
        storage_root.mkdir(parents=True, exist_ok=True)
        checks["storage"] = "ok"
    except Exception:
        checks["storage"] = "error"

    is_ready = all(result == "ok" for result in checks.values())
    payload = {
        "status": "ok" if is_ready else "degraded",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "checks": checks,
    }

    if is_ready:
        return payload

    return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content=payload)
