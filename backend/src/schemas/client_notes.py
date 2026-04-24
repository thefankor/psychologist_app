from datetime import datetime

from pydantic import BaseModel


class ClientNoteCreate(BaseModel):
    text: str


class ClientNoteSchema(BaseModel):
    id: int
    client_id: int
    text: str
    created_at: datetime
    updated_at: datetime
