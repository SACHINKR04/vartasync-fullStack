"""
VartaSync — Configuration Management
======================================
Loads API keys and settings from environment variables.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # --- LLM ---
    groq_api_key: str = ""
    google_api_key: str = ""
    openai_api_key: str = ""
    openai_api_base: str = "https://openrouter.ai/api/v1" # Example base URL for OpenRouter/custom endpoints
    anthropic_api_key: str = ""  # fallback

    # --- Speech-to-Text ---
    sarvam_api_key: str = ""
    deepgram_api_key: str = ""

    # --- Text-to-Speech ---
    elevenlabs_api_key: str = ""

    # --- WhatsApp ---
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_from: str = "whatsapp:+14155238886"

    # --- Database ---
    database_url: str = "sqlite+aiosqlite:///./vartasync.db"

    # --- App Settings ---
    app_name: str = "VartaSync"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000

    # --- LLM Model Selection ---
    llm_model: str = "llama-3.3-70b-versatile"
    llm_temperature: float = 0.5
    llm_max_tokens: int = 150

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
