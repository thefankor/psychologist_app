from pydantic import BaseModel, EmailStr, field_validator


class AuthResponse(BaseModel):
    token: str


class LoginRequest(BaseModel):
    email: EmailStr

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower() if isinstance(v, str) else v


class VerifyCodeRequest(LoginRequest):
    code: str


class EmptyModel(BaseModel):
    pass
