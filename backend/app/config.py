import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")
    
    PROJECT_NAME: str = "CYBERSHIELD"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cybershield-dev-secret-key-32-chars-long-min!!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (Default SQLite for instant local dev & tests; Postgres for production)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/cybershield.db")
    
    # Storage
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", str(BASE_DIR / "storage" / "evidence"))
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # SSRF Protection Settings
    SSRF_REQUEST_TIMEOUT_SECONDS: float = 3.0
    SSRF_MAX_RESPONSE_BYTES: int = 512 * 1024  # 512 KB
    
    # Official Indian Cybercrime Resources
    HELPLINE_1930: str = "1930"
    CYBERCRIME_PORTAL_URL: str = "https://cybercrime.gov.in"
    CERT_IN_URL: str = "https://www.cert-in.org.in"
    
settings = Settings()
