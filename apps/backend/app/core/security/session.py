import hashlib
import json
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import status
from fastapi import Response
from redis import exceptions as redis_exceptions

from app.core.config import get_settings
from app.core.exceptions import AppException, ErrorCode
from app.core.redis_client import get_redis_client


def generate_raw_session_token() -> str:
    return secrets.token_urlsafe(48)


def hash_session_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def build_session_cache_key(token_hash: str) -> str:
    settings = get_settings()
    return f"{settings.AUTH_REDIS_PREFIX}:{token_hash}"


def get_session_expire_at() -> datetime:
    settings = get_settings()
    return datetime.now(timezone.utc) + timedelta(
        minutes=settings.AUTH_SESSION_TTL_MINUTES
    )


def write_session_cache(token_hash: str, payload: dict) -> None:
    settings = get_settings()
    try:
        redis_client = get_redis_client()
        cache_key = build_session_cache_key(token_hash)
        ttl_seconds = settings.AUTH_SESSION_TTL_MINUTES * 60
        redis_client.setex(cache_key, ttl_seconds, json.dumps(payload))
    except redis_exceptions.TimeoutError as exc:
        raise AppException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            code=ErrorCode.GATEWAY_TIMEOUT,
            message="Session cache timed out.",
        ) from exc
    except redis_exceptions.ConnectionError as exc:
        raise AppException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code=ErrorCode.SERVICE_UNAVAILABLE,
            message="Session cache is unavailable.",
        ) from exc
    except redis_exceptions.RedisError as exc:
        raise AppException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            code=ErrorCode.BAD_GATEWAY,
            message="Session cache returned an invalid response.",
        ) from exc


def read_session_cache(token_hash: str) -> dict | None:
    try:
        redis_client = get_redis_client()
        cache_key = build_session_cache_key(token_hash)
        raw = redis_client.get(cache_key)
        if not raw:
            return None
        return json.loads(raw)
    except redis_exceptions.RedisError:
        # Fall back to DB lookup when cache read is unavailable.
        return None


def delete_session_cache(token_hash: str) -> None:
    try:
        redis_client = get_redis_client()
        cache_key = build_session_cache_key(token_hash)
        redis_client.delete(cache_key)
    except redis_exceptions.TimeoutError as exc:
        raise AppException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            code=ErrorCode.GATEWAY_TIMEOUT,
            message="Session cache timed out.",
        ) from exc
    except redis_exceptions.ConnectionError as exc:
        raise AppException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code=ErrorCode.SERVICE_UNAVAILABLE,
            message="Session cache is unavailable.",
        ) from exc
    except redis_exceptions.RedisError as exc:
        raise AppException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            code=ErrorCode.BAD_GATEWAY,
            message="Session cache returned an invalid response.",
        ) from exc


def set_session_cookie(response: Response, raw_token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=settings.AUTH_SESSION_COOKIE_NAME,
        value=raw_token,
        httponly=settings.AUTH_COOKIE_HTTPONLY,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        domain=settings.AUTH_COOKIE_DOMAIN,
        max_age=settings.AUTH_SESSION_TTL_MINUTES * 60,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        key=settings.AUTH_SESSION_COOKIE_NAME,
        domain=settings.AUTH_COOKIE_DOMAIN,
        path="/",
    )
