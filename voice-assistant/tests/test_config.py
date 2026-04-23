from __future__ import annotations

import pytest

from voice_assistant.config import AppConfig
from voice_assistant.exceptions import ConfigurationError


def test_config_requires_gemini_key(monkeypatch):
    monkeypatch.setattr("voice_assistant.config.load_shared_environment", lambda: None)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    with pytest.raises(ConfigurationError):
        AppConfig.from_env()


def test_config_parses_env_values(monkeypatch):
    monkeypatch.setattr("voice_assistant.config.load_shared_environment", lambda: None)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.setenv("GEMINI_API_KEY", "abc123")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.5-flash")
    monkeypatch.setenv("PIPER_BINARY", "./piper")
    monkeypatch.setenv("PIPER_MODEL_PATH", "/tmp/voice.onnx")
    monkeypatch.setenv("AUDIO_PLAYER", "aplay")
    monkeypatch.setenv("AUDIO_INPUT_DEVICE", "2")
    monkeypatch.setenv("MAX_HISTORY_MESSAGES", "12")
    monkeypatch.setenv("VOICE_ASSISTANT_RECORD_SECONDS", "4.5")
    monkeypatch.setenv("VOICE_ASSISTANT_WHISPER_MODEL_SIZE", "small")
    monkeypatch.setenv("VOICE_ASSISTANT_WHISPER_DEVICE", "cuda")
    monkeypatch.setenv("VOICE_ASSISTANT_WHISPER_COMPUTE_TYPE", "float16")

    config = AppConfig.from_env()

    assert config.gemini_api_key == "abc123"
    assert config.audio_input_device == 2
    assert config.max_history_messages == 12
    assert config.record_seconds == 4.5
    assert config.whisper_model_size == "small"
    assert config.whisper_device == "cuda"
    assert config.whisper_compute_type == "float16"


def test_config_allows_no_tts_mode_without_piper_model(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "abc123")
    monkeypatch.delenv("PIPER_MODEL_PATH", raising=False)

    config = AppConfig.from_env(speak_responses=False)

    assert config.speak_responses is False


def test_config_allows_vad_override(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "abc123")
    monkeypatch.setenv("PIPER_MODEL_PATH", "/tmp/voice.onnx")

    config = AppConfig.from_env(use_vad=False)

    assert config.use_vad is False


def test_system_instruction_is_direct_and_clear():
    instruction = AppConfig(
        gemini_api_key="abc123",
        piper_model_path="/tmp/voice.onnx",
    ).system_instruction

    assert "frases curtas" in instruction
    assert "linguagem simples" in instruction
    assert "figura materna atenta" in instruction
