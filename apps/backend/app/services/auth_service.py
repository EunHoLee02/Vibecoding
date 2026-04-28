from fastapi import Request, Response, status

from app.core.exceptions import AppException, ErrorCode
from app.core.security.password import hash_password, verify_password
from app.core.security.session import (
    clear_session_cookie,
    delete_session_cache,
    generate_raw_session_token,
    get_session_expire_at,
    hash_session_token,
    read_session_cache,
    set_session_cookie,
    write_session_cache,
)
from app.db.repositories.session_repository import SessionRepository
from app.db.repositories.user_repository import UserRepository
from app.schemas.auth import CurrentPrincipalData


class AuthService:
    def __init__(self) -> None:
        self.user_repo = UserRepository()
        self.session_repo = SessionRepository()

    def signup(self, db, email: str, password: str, name: str):
        normalized_email = email.strip().lower()
        existing = self.user_repo.get_by_email(db, normalized_email)
        if existing:
            raise AppException(
                status_code=status.HTTP_409_CONFLICT,
                code=ErrorCode.CONFLICT,
                message="이미 사용 중인 이메일입니다.",
                detail={"field": "email"},
            )

        user = self.user_repo.create(
            db=db,
            email=normalized_email,
            password_hash=hash_password(password),
            name=name.strip(),
        )
        db.commit()
        db.refresh(user)
        return user

    def login(
        self,
        db,
        response: Response,
        email: str,
        password: str,
        ip_address: str | None,
        user_agent: str | None,
    ):
        normalized_email = email.strip().lower()
        user = self.user_repo.get_by_email(db, normalized_email)

        if not user or not verify_password(password, user.password_hash):
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code=ErrorCode.UNAUTHORIZED,
                message="이메일 또는 비밀번호가 올바르지 않습니다.",
            )

        if user.deleted_at is not None or user.status != "active":
            raise AppException(
                status_code=status.HTTP_403_FORBIDDEN,
                code=ErrorCode.FORBIDDEN,
                message="로그인할 수 없는 계정 상태입니다.",
            )

        raw_token = generate_raw_session_token()
        token_hash = hash_session_token(raw_token)
        expires_at = get_session_expire_at()

        session = self.session_repo.create(
            db=db,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        payload = {
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "session_id": str(session.id),
        }
        write_session_cache(token_hash, payload)

        set_session_cookie(response, raw_token)
        db.commit()
        return user

    def logout(self, db, response: Response, raw_session_token: str):
        token_hash = hash_session_token(raw_session_token)
        session = self.session_repo.get_active_by_token_hash(db, token_hash)
        if not session:
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code=ErrorCode.UNAUTHORIZED,
                message="유효한 세션이 없습니다.",
            )

        self.session_repo.revoke(db, session)
        delete_session_cache(token_hash)
        clear_session_cookie(response)
        db.commit()

    def refresh(self, db, response: Response, raw_session_token: str):
        old_token_hash = hash_session_token(raw_session_token)
        session = self.session_repo.get_active_by_token_hash(db, old_token_hash)
        if not session:
            raise AppException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                code=ErrorCode.UNAUTHORIZED,
                message="유효한 세션이 없습니다.",
            )

        new_raw_token = generate_raw_session_token()
        new_token_hash = hash_session_token(new_raw_token)
        new_expires_at = get_session_expire_at()

        updated_session = self.session_repo.rotate(
            db=db,
            session=session,
            new_token_hash=new_token_hash,
            new_expires_at=new_expires_at,
        )

        delete_session_cache(old_token_hash)

        payload = {
            "user_id": str(updated_session.user_id),
            "email": updated_session.user.email
            if getattr(updated_session, "user", None)
            else None,
            "role": updated_session.user.role
            if getattr(updated_session, "user", None)
            else None,
            "status": updated_session.user.status
            if getattr(updated_session, "user", None)
            else None,
            "session_id": str(updated_session.id),
        }
        write_session_cache(new_token_hash, payload)
        set_session_cookie(response, new_raw_token)
        db.commit()
        return updated_session

    def get_current_principal_by_session_token(
        self,
        db=None,
        raw_session_token: str | None = None,
        request: Request | None = None,
    ):
        if not raw_session_token:
            return None

        token_hash = hash_session_token(raw_session_token)
        cached = read_session_cache(token_hash)

        if cached:
            try:
                return CurrentPrincipalData(
                    user_id=str(cached["user_id"]),
                    email=cached["email"],
                    role=cached["role"],
                    status=cached["status"],
                )
            except Exception:
                pass

        if db is None and request is not None:
            db = request.state.db if hasattr(request.state, "db") else None

        if db is None:
            return None

        session = self.session_repo.get_active_by_token_hash(db, token_hash)
        if not session:
            return None

        user = session.user
        if not user or user.deleted_at is not None or user.status != "active":
            return None

        payload = {
            "user_id": str(user.id),
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "session_id": str(session.id),
        }
        write_session_cache(token_hash, payload)

        return CurrentPrincipalData(
            user_id=str(user.id),
            email=user.email,
            role=user.role,
            status=user.status,
        )
