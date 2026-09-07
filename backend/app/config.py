from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SIH Dead Reckoning API"
    environment: str = "development"
    database_url: str = "sqlite+aiosqlite:///./sih_dead_reckoning.db"
    redis_url: str | None = None
    redis_telemetry_channel: str = "telemetry:live"
    model_directory: str = "model_artifacts"
    s3_endpoint_url: str | None = None
    s3_bucket: str = "idr-models"
    s3_access_key: str | None = None
    s3_secret_key: str | None = None
    s3_region: str = "us-east-1"
    max_model_upload_size_bytes: int = 50 * 1024 * 1024  # 50 MB
    storage_backend: str = "auto"
    api_key: str | None = None
    cors_origins: list[str] = ["*"]
    log_level: str = "INFO"

    # Phase 7 Auth & JWT Environment Settings
    jwt_secret: str | None = None
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    jwt_refresh_expire_minutes: int = 10080  # 7 days (10080 mins)
    device_token_expire_minutes: int = 525600  # 1 year (525600 mins)

    model_config = SettingsConfigDict(env_file=".env", env_prefix="SIH_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
