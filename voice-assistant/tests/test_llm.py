from __future__ import annotations

from dataclasses import dataclass

import pytest

from voice_assistant.config import AppConfig
from voice_assistant.llm import GeminiConversation


@dataclass
class FakeResponse:
    text: str


class FakeModels:
    def __init__(self):
        self.calls = []

    def generate_content(self, model, contents, config=None):
        self.calls.append({"model": model, "contents": contents, "config": config})
        last_user = next(item for item in reversed(contents) if item["role"] == "user")
        text = last_user["parts"][0]["text"]
        return FakeResponse(text=f"resposta: {text}")


class FakeClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.models = FakeModels()


class FakeGenAI:
    def Client(self, api_key):
        return FakeClient(api_key)


class UnavailableModels:
    def __init__(self):
        self.calls = []

    def generate_content(self, model, contents, config=None):
        self.calls.append({"model": model, "contents": contents, "config": config})
        raise RuntimeError("503 UNAVAILABLE. This model is currently experiencing high demand.")


class UnavailableClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.models = UnavailableModels()


class UnavailableGenAI:
    def Client(self, api_key):
        return UnavailableClient(api_key)


def test_gemini_conversation_keeps_history_and_rebuilds():
    fake_genai = FakeGenAI()
    config = AppConfig(
        gemini_api_key="test-key",
        max_history_messages=2,
        piper_model_path="/tmp/voice.onnx",
    )
    conversation = GeminiConversation(config, genai_module=fake_genai)

    first = conversation.send("oi")
    second = conversation.send("tudo bem?")

    assert conversation.client.api_key == "test-key"
    assert first.text == "resposta: oi"
    assert second.text == "resposta: tudo bem?"
    assert len(conversation.history.messages) == 2
    assert len(conversation.client.models.calls) == 2


def test_gemini_conversation_falls_back_on_unavailable_model():
    unavailable_genai = UnavailableGenAI()
    config = AppConfig(
        gemini_api_key="test-key",
        max_history_messages=4,
        piper_model_path="/tmp/voice.onnx",
    )
    conversation = GeminiConversation(config, genai_module=unavailable_genai)

    with pytest.raises(Exception):
        conversation.send("estou ansioso")
