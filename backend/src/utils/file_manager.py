from io import BytesIO
from pathlib import Path
from uuid import uuid4
from PIL import Image
from fastapi import UploadFile, HTTPException

from src.config import constants


class FileManager:
    def __init__(self, upload_path: str):
        self.upload_path = upload_path
        self.upload_dir = Path(upload_path)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def generate_filename(file: UploadFile, default_ext=".jpg") -> str:
        ext = Path(file.filename).suffix or default_ext
        return f"{uuid4().hex}{ext}"

    async def save_image(self, file: UploadFile, quality: int = 75) -> str:

        filename = self.generate_filename(file)
        save_path = self.upload_dir / filename

        contents = await file.read()
        try:
            img = Image.open(BytesIO(contents))
            img = img.convert("RGB")
            img.save(save_path, optimize=True, quality=quality)
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail={
                    "detail": "Invalid image upload.",
                    "message": "The image file is corrupted or unreadable",
                },
            )

        return f"/{self.upload_path}/{filename}"

    def delete_file(self, url_path: str) -> None:
        """Удаляет файл по URL-пути, например '/static/news/abc.jpg'"""
        try:
            relative_path = url_path.removeprefix(constants.STATIC_BASE_URL).lstrip("/")
            file_path = constants.STATIC_ROOT / relative_path

            print(f"🗑 Удаляем: {file_path}")
            if file_path.exists():
                file_path.unlink()
            else:
                print("Файл не найден")
        except Exception as e:
            print(f"Ошибка при удалении: {e}")
