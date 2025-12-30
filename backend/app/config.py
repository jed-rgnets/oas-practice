"""Application configuration."""

from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "OAS Practice"
    app_version: str = "0.1.0"
    debug: bool = False

    # API
    api_prefix: str = "/api/v1"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Paths
    scenarios_path: str = str(Path(__file__).parent.parent / "scenarios")

    # Future: LLM Integration
    llm_provider: Optional[str] = None
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"
    groq_api_key: Optional[str] = None

    model_config = {"env_prefix": "OAS_PRACTICE_"}

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
