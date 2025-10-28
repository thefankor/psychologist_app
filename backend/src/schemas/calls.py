from uuid import UUID

from pydantic import BaseModel


class CallTokenResponse(BaseModel):
    ws_url: str
    token: str


class CallTokenRequest(BaseModel):
    appointment_id: UUID
