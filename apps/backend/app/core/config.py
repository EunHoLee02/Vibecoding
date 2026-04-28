from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "well-track-backend"
    APP_ENV: str = "local"
    APP_DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    BACKEND_CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    BACKEND_PUBLIC_BASE_URL: str = "http://localhost:8000"
    LOCAL_STORAGE_DIR: str = ".storage"

    DATABASE_URL: str = Field(
        default="postgresql+psycopg://app_user:app_password@localhost:5432/app_local"
    )
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 5
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_POOL_RECYCLE: int = 1800
    DATABASE_POOL_PRE_PING: bool = True

    REDIS_URL: str = "redis://localhost:6379/0"
    AUTH_REDIS_PREFIX: str = "auth:session"

    AUTH_SESSION_COOKIE_NAME: str = "sid"
    AUTH_SESSION_TTL_MINUTES: int = 60 * 24 * 7
    AUTH_COOKIE_SECURE: bool = False
    AUTH_COOKIE_HTTPONLY: bool = True
    AUTH_COOKIE_SAMESITE: str = "lax"
    AUTH_COOKIE_DOMAIN: str | None = None

    PASSWORD_MIN_LENGTH: int = 8
    PASSWORD_MAX_LENGTH: int = 128

    R2_ENDPOINT: str | None = None
    R2_ACCESS_KEY_ID: str | None = None
    R2_SECRET_ACCESS_KEY: str | None = None
    R2_BUCKET: str | None = None

    MAIL_MODE: str = "logger"

    OCR_ENGINE: str = "paddleocr"
    OCR_LANG_LIST: str = "ko,en"

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
