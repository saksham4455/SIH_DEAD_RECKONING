from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "SIH Dead Reckoning API"
    environment: str = "development"
    database_url: str = "sqlite+aiosqlite:///./sih_dead_reckoning.db"
    redis_url: str | None = None
    model_directory: str = "model_artifacts"
    api_key: str | None = None
    cors_origins: list[str] = ["*"]

    model_config = SettingsConfigDict(env_file=".env", env_prefix="SIH_", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
