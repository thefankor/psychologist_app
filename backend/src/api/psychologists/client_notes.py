from fastapi import APIRouter, Depends, HTTPException
from src.core.dependencies import get_current_psychologist_id, get_store
from src.crud import Store
from src.schemas.client_notes import ClientNoteCreate, ClientNoteSchema

router = APIRouter(tags=["Psychologists Client Notes"])

_403_response = {
    403: {
        "description": "Нет записей с этим клиентом",
        "content": {
            "application/json": {"example": {"detail": "Нет записей с этим клиентом"}}
        },
    },
}


async def _check_shared_appointment(
    client_id: int,
    current_psychologist: int = Depends(get_current_psychologist_id),
    store: Store = Depends(get_store),
):
    has_appointment = await store.appointment_attendee.has_shared_appointment(
        psychologist_id=current_psychologist, client_id=client_id
    )
    if not has_appointment:
        raise HTTPException(status_code=403, detail="Нет записей с этим клиентом")


@router.get(
    "/{client_id}/notes",
    summary="Get client notes",
    description="Получить заметки психолога о клиенте",
    dependencies=[Depends(_check_shared_appointment)],
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
        **_403_response,
    },
)
async def get_client_notes(
    client_id: int,
    limit: int = 25,
    offset: int = 0,
    current_psychologist: int = Depends(get_current_psychologist_id),
    store: Store = Depends(get_store),
) -> list[ClientNoteSchema]:
    notes = await store.client_note.find_by_psychologist_and_client(
        psychologist_id=current_psychologist,
        client_id=client_id,
        limit=limit,
        offset=offset,
    )
    return [
        ClientNoteSchema(
            id=note.id,
            client_id=note.client_id,
            text=note.text,
            created_at=note.created_at,
            updated_at=note.updated_at,
        )
        for note in notes
    ]


@router.post(
    "/{client_id}/notes",
    summary="Create client note",
    description="Добавить заметку о клиенте",
    status_code=201,
    dependencies=[Depends(_check_shared_appointment)],
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
        **_403_response,
    },
)
async def create_client_note(
    client_id: int,
    data: ClientNoteCreate,
    current_psychologist: int = Depends(get_current_psychologist_id),
    store: Store = Depends(get_store),
) -> ClientNoteSchema:
    note = await store.client_note.add(
        psychologist_id=current_psychologist,
        client_id=client_id,
        text=data.text,
    )
    return ClientNoteSchema(
        id=note.id,
        client_id=note.client_id,
        text=note.text,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


@router.delete(
    "/{client_id}/notes/{note_id}",
    summary="Delete client note",
    description="Удалить заметку о клиенте",
    status_code=204,
    dependencies=[Depends(_check_shared_appointment)],
    responses={
        401: {
            "description": "Токен не валиден",
            "content": {
                "application/json": {"example": {"detail": "Токен не валиден"}}
            },
        },
        **_403_response,
        404: {
            "description": "Заметка не найдена",
            "content": {
                "application/json": {"example": {"detail": "Заметка не найдена"}}
            },
        },
    },
)
async def delete_client_note(
    client_id: int,
    note_id: int,
    current_psychologist: int = Depends(get_current_psychologist_id),
    store: Store = Depends(get_store),
):
    note = await store.client_note.find_one_or_none(
        id=note_id,
        psychologist_id=current_psychologist,
        client_id=client_id,
    )
    if not note:
        raise HTTPException(status_code=404, detail="Заметка не найдена")

    await store.client_note.delete(model_id=note_id)
