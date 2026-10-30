import os
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from backend.app.config import settings
from backend.app.evidence.hashing import calculate_sha256_stream

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf", ".txt", ".csv"}
ALLOWED_MIME_TYPES = {
    "image/png", "image/jpeg", "image/jpg",
    "application/pdf", "text/plain", "text/csv"
}

def save_uploaded_evidence(file: UploadFile) -> Tuple[str, str, int, str]:
    """
    Validate, securely hash, and save an evidence file into private object storage.
    Returns: (stored_relative_path, sha256_hash, file_size_bytes, original_filename)
    """
    # 1. Filename & Extension validation
    original_filename = Path(file.filename or "evidence.bin").name
    ext = Path(original_filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File extension '{ext}' is prohibited. Permitted types: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 2. Storage Directory Setup & Path Traversal Prevention
    storage_root = Path(settings.STORAGE_DIR).resolve()
    storage_root.mkdir(parents=True, exist_ok=True)

    # 3. Calculate SHA-256 Digest
    sha256_hash = calculate_sha256_stream(file.file)

    # 4. Generate unique randomized file identity (UUID.ext)
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    target_path = (storage_root / unique_filename).resolve()

    # Verify canonical path remains within storage_root
    if not str(target_path).startswith(str(storage_root)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Illegal path traversal sequence in filename."
        )

    # 5. Write to Disk in safe chunks with byte limit check
    total_bytes = 0
    file.file.seek(0)
    with open(target_path, "wb") as out_file:
        while chunk := file.file.read(65536):
            total_bytes += len(chunk)
            if total_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
                out_file.close()
                target_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Evidence file exceeds maximum permitted size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
                )
            out_file.write(chunk)

    return str(target_path), sha256_hash, total_bytes, original_filename
