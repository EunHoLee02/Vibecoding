import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import (
    AppException,
    ErrorCode,
    app_exception_handler,
    get_error_code_for_status,
)

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.APP_DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):
    request.state.request_id = str(uuid.uuid4())
    response = await call_next(request)
    response.headers["X-Request-Id"] = request.state.request_id
    return response


@app.exception_handler(AppException)
async def handle_app_exception(request: Request, exc: AppException):
    return await app_exception_handler(request, exc)


@app.exception_handler(RequestValidationError)
async def handle_request_validation_error(
    request: Request, exc: RequestValidationError
):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "code": ErrorCode.INVALID_INPUT.value,
            "message": "Invalid request input.",
            "detail": {"errors": exc.errors()},
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, dict) else {}

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "code": get_error_code_for_status(exc.status_code).value,
            "message": str(exc.detail) if isinstance(exc.detail, str) else "HTTP error.",
            "detail": detail,
            "request_id": getattr(request.state, "request_id", None),
        },
    )


@app.exception_handler(Exception)
async def handle_unexpected_exception(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "code": ErrorCode.INTERNAL_ERROR.value,
            "message": "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            "detail": {},
            "request_id": getattr(request.state, "request_id", None),
        },
    )


app.include_router(api_router)
