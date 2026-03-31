from livekit import api
from src.config import settings


class CallsUtils:
    @staticmethod
    async def get_token(user_id: int, username: str, room_name: str) -> str:
        token = (
            api.AccessToken(
                api_key=settings.LIVEKIT_API_KEY, api_secret=settings.LIVEKIT_API_SECRET
            )
            .with_identity(str(user_id))
            .with_name(username)
            .with_grants(
                api.VideoGrants(
                    room_join=True,
                    room=str(room_name),
                )
            )
        )
        return token.to_jwt()
