import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.config import settings

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
}
MAX_FILE_SIZE = 5 * 1024 * 1024


@router.post("")
async def upload_reference_image(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Image must be 5 MB or smaller")

    extension = Path(file.filename or "").suffix.lower()
    if extension not in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif"}:
        extension = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif",
        }.get(file.content_type, ".jpg")

    filename = f"{uuid.uuid4().hex}{extension}"
    destination = settings.upload_dir / filename
    destination.write_bytes(content)

    return {
        "url": f"/uploads/{filename}",
        "filename": file.filename or filename,
    }
