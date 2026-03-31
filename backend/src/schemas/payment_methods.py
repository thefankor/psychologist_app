from pydantic import BaseModel, Field, field_validator
from src.utils.validators import normalize_and_validate_phone


class BaseModelWithPhoneValidation(BaseModel):
    phone: str = Field("+79994445678")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        return normalize_and_validate_phone(v)


class SBPRequest(BaseModelWithPhoneValidation):
    phone: str = Field("+79994445678")
    bank: str


class SBP(BaseModelWithPhoneValidation):
    id: int
    phone: str = Field("+79994445678")
    bank: str


class SBPRequestVerify(BaseModelWithPhoneValidation):
    phone: str = Field("+79994445678")
    code: str


class ProfilePaymentMethod(BaseModel):
    sbp: list[SBP] | None = None
