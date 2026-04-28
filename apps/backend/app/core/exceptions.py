from enum import Enum
from fastapi import Request
from fastapi.responses import JSONResponse


class ErrorCode(str, Enum):
    INVALID_INPUT = "INVALID_INPUT"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    BAD_GATEWAY = "BAD_GATEWAY"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    GATEWAY_TIMEOUT = "GATEWAY_TIMEOUT"


class AppException(Exception):
    def __init__(
        self,
        status_code: int,
        code: ErrorCode,
        message: str,
        detail: dict | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.detail = detail or {}


STATUS_TO_ERROR_CODE: dict[int, ErrorCode] = {
    400: ErrorCode.INVALID_INPUT,
    401: ErrorCode.UNAUTHORIZED,
    403: ErrorCode.FORBIDDEN,
    404: ErrorCode.NOT_FOUND,
    409: ErrorCode.CONFLICT,
    429: ErrorCode.TOO_MANY_REQUESTS,
    500: ErrorCode.INTERNAL_ERROR,
    502: ErrorCode.BAD_GATEWAY,
    503: ErrorCode.SERVICE_UNAVAILABLE,
    504: ErrorCode.GATEWAY_TIMEOUT,
}


def get_error_code_for_status(status_code: int) -> ErrorCode:
    return STATUS_TO_ERROR_CODE.get(status_code, ErrorCode.INTERNAL_ERROR)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "code": exc.code.value,
            "message": exc.message,
            "detail": exc.detail,
            "request_id": request_id,
        },
    )
