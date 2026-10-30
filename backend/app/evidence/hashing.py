import hashlib
from typing import BinaryIO

def calculate_sha256_stream(file_stream: BinaryIO) -> str:
    """Calculate SHA-256 cryptographic digest of a binary file stream in chunks."""
    sha256 = hashlib.sha256()
    while chunk := file_stream.read(65536):
        sha256.update(chunk)
    file_stream.seek(0)
    return sha256.hexdigest().lower()

def calculate_sha256_bytes(data: bytes) -> str:
    """Calculate SHA-256 cryptographic digest of byte content."""
    return hashlib.sha256(data).hexdigest().lower()

def verify_file_integrity(file_path: str, expected_sha256: str) -> bool:
    """Verify stored file matches original recorded SHA-256 hash."""
    try:
        with open(file_path, "rb") as f:
            calculated = calculate_sha256_stream(f)
            return calculated == expected_sha256.lower()
    except (OSError, IOError):
        return False
