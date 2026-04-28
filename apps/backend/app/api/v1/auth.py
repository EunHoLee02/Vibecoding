from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps.auth import (
    get_client_ip,
    get_current_principal,
    get_raw_session_token,
    get_user_agent,
)
from app.common.responses import success_response
from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    PasswordResetConfirmRequest,
    PasswordResetRequestRequest,
    PasswordResetValidateResponse,
    SignUpRequest,
    UserSummary,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])
service = AuthService()


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignUpRequest,
    db: Session = Depends(get_db),
):
    user = service.signup(
        db=db,
        email=payload.email,
        password=payload.password,
        name=payload.name,
    )
    return success_response(
        data={
            "user": UserSummary.model_validate(user).model_dump(),
        }
    )


@router.post("/login", status_code=status.HTTP_200_OK)
def login(
    payload: LoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
):
    user = service.login(
        db=db,
        response=response,
        email=payload.email,
        password=payload.password,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return success_response(
        data={
            "user": UserSummary.model_validate(user).model_dump(),
        }
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    response: Response,
    raw_session_token: str = Depends(get_raw_session_token),
    db: Session = Depends(get_db),
):
    service.logout(
        db=db,
        response=response,
        raw_session_token=raw_session_token,
    )
    return success_response(data={"logged_out": True})


@router.post("/refresh", status_code=status.HTTP_200_OK)
def refresh(
    response: Response,
    raw_session_token: str = Depends(get_raw_session_token),
    db: Session = Depends(get_db),
):
    session = service.refresh(
        db=db,
        response=response,
        raw_session_token=raw_session_token,
    )
    return success_response(
        data={
            "session_id": str(session.id),
            "expires_at": session.expires_at.isoformat(),
        }
    )


@router.get("/me", status_code=status.HTTP_200_OK)
def me(
    principal=Depends(get_current_principal),
):
    return success_response(
        data={
            "id": principal.user_id,
            "email": principal.email,
            "role": principal.role,
            "status": principal.status,
        }
    )


@router.post("/password-reset/request", status_code=status.HTTP_200_OK)
def request_password_reset(
    payload: PasswordResetRequestRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    result = service.request_password_reset(
        db=db,
        email=payload.email,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )
    return success_response(data=result)


@router.get("/password-reset/validate", status_code=status.HTTP_200_OK)
def validate_password_reset(
    token: str,
    db: Session = Depends(get_db),
):
    result = service.validate_password_reset_token(db=db, token=token)
    response = PasswordResetValidateResponse(**result)
    return success_response(data=response.model_dump())


@router.post("/password-reset/confirm", status_code=status.HTTP_200_OK)
def confirm_password_reset(
    payload: PasswordResetConfirmRequest,
    db: Session = Depends(get_db),
):
    result = service.confirm_password_reset(
        db=db,
        token=payload.token,
        new_password=payload.new_password,
    )
    return success_response(data=result)
