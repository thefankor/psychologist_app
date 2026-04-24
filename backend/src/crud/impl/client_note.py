from sqlalchemy import select
from src.core.wrapper import handle_db_errors
from src.crud.impl.base import BaseDAO
from src.models.client_note import ClientNote


class ClientNoteDAO(BaseDAO):
    model = ClientNote

    @handle_db_errors
    async def find_by_psychologist_and_client(
        self, psychologist_id: int, client_id: int, limit: int, offset: int
    ):
        query = (
            select(ClientNote)
            .where(
                ClientNote.psychologist_id == psychologist_id,
                ClientNote.client_id == client_id,
            )
            .order_by(ClientNote.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(query)
        return result.scalars().all()
