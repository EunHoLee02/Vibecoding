from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.supplements import router as supplements_router
from app.api.v1.analyses import router as analyses_router
from app.api.v1.inquiries import router as inquiries_router
from app.api.v1.admin_inquiries import router as admin_inquiries_router
from app.api.v1.ocr import router as ocr_router
from app.api.v1.health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(supplements_router)
api_router.include_router(analyses_router)
api_router.include_router(inquiries_router)
api_router.include_router(admin_inquiries_router)
api_router.include_router(ocr_router)
