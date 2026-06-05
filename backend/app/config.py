from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    mongodb_uri: str
    mongodb_db_name: str = "cake_order_app"
    cors_origins: str = "http://localhost:5174,http://127.0.0.1:5174"
    upload_dir: Path = BACKEND_DIR / "uploads"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
