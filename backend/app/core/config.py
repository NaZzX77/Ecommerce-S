from functools import cached_property

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Ecommerce-S API"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    database_url: str = "mysql+pymysql://root:password@localhost:3306/ecommerce_s"

    jwt_secret_key: str = Field(default="change-this-development-secret", min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    backend_cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @cached_property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


settings = Settings()

