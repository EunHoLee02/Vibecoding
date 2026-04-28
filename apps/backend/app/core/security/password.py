import re

from fastapi import status
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.exceptions import AppException, ErrorCode

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
SPECIAL_CHAR_PATTERN = r"[!@#$%^&*()_+\-=\[\]{};:,.?/]"


def validate_password_rules(password: str) -> None:
    settings = get_settings()

    if len(password) < settings.PASSWORD_MIN_LENGTH:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            code=ErrorCode.INVALID_INPUT,
            message=f"비밀번호는 최소 {settings.PASSWORD_MIN_LENGTH}자 이상이어야 합니다.",
            detail={"field": "password"},
        )

    if len(password) > settings.PASSWORD_MAX_LENGTH:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            code=ErrorCode.INVALID_INPUT,
            message=f"비밀번호는 {settings.PASSWORD_MAX_LENGTH}자를 초과할 수 없습니다.",
            detail={"field": "password"},
        )

    if not re.search(r"[A-Za-z]", password):
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            code=ErrorCode.INVALID_INPUT,
            message="비밀번호는 영문을 1자 이상 포함해야 합니다.",
            detail={"field": "password"},
        )

    if not re.search(r"\d", password):
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            code=ErrorCode.INVALID_INPUT,
            message="비밀번호는 숫자를 1자 이상 포함해야 합니다.",
            detail={"field": "password"},
        )

    if not re.search(SPECIAL_CHAR_PATTERN, password):
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            code=ErrorCode.INVALID_INPUT,
            message="비밀번호는 특수문자를 1자 이상 포함해야 합니다.",
            detail={"field": "password"},
        )


def hash_password(password: str) -> str:
    validate_password_rules(password)
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
