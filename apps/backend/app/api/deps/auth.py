from collections.abc import Callable

from fastapi import Depends, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import AppException, ErrorCode
from app.db.session import get_db
from app.schemas.auth import CurrentPrincipalData
from app.services.auth_service import AuthService


auth_service = AuthService()


def get_raw_session_token(request: Request) -> str:
    settings = get_settings()
    token = request.cookies.get(settings.AUTH_SESSION_COOKIE_NAME)

    if not token:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=ErrorCode.UNAUTHORIZED,
            message="로그인이 필요합니다.",
        )
    return token


def get_client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    if request.client:
        return request.client.host

    return None


def get_user_agent(request: Request) -> str | None:
    return request.headers.get("user-agent")


def get_current_principal(
    raw_session_token: str = Depends(get_raw_session_token),
    db: Session = Depends(get_db),
) -> CurrentPrincipalData:
    principal = auth_service.get_current_principal_by_session_token(
        db=db,
        raw_session_token=raw_session_token,
    )

    if principal is None:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=ErrorCode.UNAUTHORIZED,
            message="유효하지 않거나 만료된 세션입니다.",
        )

    return principal


def require_roles(*allowed_roles: str) -> Callable:
    def dependency(
        principal: CurrentPrincipalData = Depends(get_current_principal),
    ) -> CurrentPrincipalData:
        if principal.role not in allowed_roles:
            raise AppException(
                status_code=status.HTTP_403_FORBIDDEN,
                code=ErrorCode.FORBIDDEN,
                message="접근 권한이 없습니다.",
                detail={"allowed_roles": list(allowed_roles)},
            )
        return principal

    return dependency
