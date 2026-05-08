"""
VartaSync — Audio Pipeline Module
====================================
Provides STT (Speech-to-Text) and TTS (Text-to-Speech) integration.

Production path: Sarvam AI (Saarika STT + Bulbul TTS)
Browser path: Web Speech API (handled in frontend useVoice.ts)

This module is used when telephony integration (Twilio/SIP) is enabled.
For browser-based demo, the frontend Web Speech API handles audio natively.
"""

import base64
import logging
from typing import Optional

import httpx

from app.config import get_settings

logger = logging.getLogger("vartasync")

# Sarvam AI API endpoints
SARVAM_STT_URL = "https://api.sarvam.ai/speech-to-text-translate"
SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech"

# Language mapping for Sarvam
SARVAM_LANG_MAP = {
    "hindi": "hi-IN",
    "english": "en-IN",
    "hinglish": "hi-IN",
    "kannada": "kn-IN",
}

# TTS voice mapping for Sarvam Bulbul
SARVAM_TTS_VOICES = {
    "hindi": "anushka",       # Female Hindi voice for bulbul:v2
    "english": "anushka",
    "hinglish": "anushka",
    "kannada": "anushka",
}


async def stt_sarvam(
    audio_bytes: bytes,
    language: str = "hinglish",
    sample_rate: int = 16000,
) -> Optional[str]:
    """
    Transcribe audio using Sarvam AI Saarika STT.

    Args:
        audio_bytes: Raw audio bytes (PCM16 or WAV)
        language: Language code
        sample_rate: Audio sample rate

    Returns:
        Transcribed text or None on failure
    """
    settings = get_settings()
    if not settings.sarvam_api_key:
        logger.warning("Sarvam API key not configured — STT skipped")
        return None

    lang_code = SARVAM_LANG_MAP.get(language, "hi-IN")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Sarvam expects base64-encoded audio
            audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")

            response = await client.post(
                SARVAM_STT_URL,
                headers={
                    "api-subscription-key": settings.sarvam_api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "input": audio_b64,
                    "language_code": lang_code,
                    "model": "saarika:v2",
                    "with_timestamps": False,
                },
            )
            response.raise_for_status()
            result = response.json()

            transcript = result.get("transcript", "")
            logger.info(f"[STT] Sarvam transcribed: '{transcript[:100]}'")
            return transcript

    except httpx.HTTPStatusError as e:
        logger.error(f"[STT] Sarvam API error: {e.response.status_code} — {e.response.text[:200]}")
        return None
    except Exception as e:
        logger.error(f"[STT] Sarvam error: {e}")
        return None


async def tts_sarvam(
    text: str,
    language: str = "hinglish",
    speed: float = 1.0,
) -> Optional[bytes]:
    """
    Convert text to speech using Sarvam AI Bulbul TTS.

    Args:
        text: Text to speak
        language: Language code
        speed: Speech speed multiplier

    Returns:
        Audio bytes (WAV) or None on failure
    """
    settings = get_settings()
    if not settings.sarvam_api_key:
        logger.warning("Sarvam API key not configured — TTS skipped")
        return None

    lang_code = SARVAM_LANG_MAP.get(language, "hi-IN")
    voice = SARVAM_TTS_VOICES.get(language, "pooja")

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                SARVAM_TTS_URL,
                headers={
                    "api-subscription-key": settings.sarvam_api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "inputs": [text],
                    "target_language_code": lang_code,
                    "speaker": voice,
                    "model": "bulbul:v2",
                    "pace": speed,
                    "loudness": 1.5,
                    "enable_preprocessing": True,
                },
            )
            response.raise_for_status()
            result = response.json()

            # Sarvam returns base64-encoded audio in 'audios' array
            audios = result.get("audios", [])
            if audios:
                audio_bytes = base64.b64decode(audios[0])
                logger.info(f"[TTS] Sarvam generated {len(audio_bytes)} bytes for: '{text[:50]}'")
                return audio_bytes

            logger.warning("[TTS] Sarvam returned empty audio")
            return None

    except httpx.HTTPStatusError as e:
        logger.error(f"[TTS] Sarvam API error: {e.response.status_code} — {e.response.text[:200]}")
        return None
    except Exception as e:
        logger.error(f"[TTS] Sarvam error: {type(e).__name__} - {e}")
        return None


async def generate_opening_audio(language: str = "hinglish") -> Optional[bytes]:
    """
    Pre-generate the opening line audio for zero-latency call start.
    Cache this on startup for each supported language.
    """
    from app.prompts import OPENING_LINES

    text = OPENING_LINES.get(language, OPENING_LINES["hinglish"])
    return await tts_sarvam(text, language)


# Pre-cached audio store (populated on startup if Sarvam key is available)
CACHED_OPENING_AUDIO: dict[str, bytes] = {}


async def cache_opening_audio():
    """Pre-generate and cache opening line audio for all languages."""
    settings = get_settings()
    if not settings.sarvam_api_key:
        logger.info("[TTS] Skipping audio cache — no Sarvam API key")
        return

    for lang in ["hindi", "english", "hinglish"]:
        audio = await generate_opening_audio(lang)
        if audio:
            CACHED_OPENING_AUDIO[lang] = audio
            logger.info(f"[TTS] Cached opening audio for {lang} ({len(audio)} bytes)")
