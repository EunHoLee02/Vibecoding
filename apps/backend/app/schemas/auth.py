from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class SignUpRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        return value.strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserSummary(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    role: str
    status: str

    class Config:
        from_attributes = True


class CurrentPrincipalData(BaseModel):
    user_id: str
    email: EmailStr
    role: str
    status: str


class PasswordResetRequestRequest(BaseModel):
    email: EmailStr


class PasswordResetValidateResponse(BaseModel):
    valid: bool
    expires_at: str | None = None


class PasswordResetConfirmRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)
