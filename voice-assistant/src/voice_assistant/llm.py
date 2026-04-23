from __future__ import annotations

from dataclasses import dataclass
from typing import Any

try:
    from google import genai
    from google.genai import types
except ImportError:  # pragma: no cover - optional at import time
    genai = None  # type: ignore[assignment]
    types = None  # type: ignore[assignment]

from .config import AppConfig
from .exceptions import ConfigurationError, LLMError
from .session import ConversationHistory


DEFAULT_FALLBACK_MODELS = ("gemini-2.5-flash",)
RETRYABLE_ERROR_HINTS = (
    "not_found",
    "not found",
    "503",
    "unavailable",
    "high demand",
    "temporarily",
    "rate limit",
    "resource exhausted",
    "quota",
    "429",
)


@dataclass(slots=True)
class GeminiReply:
    text: str
    raw_response: Any | None = None


class GeminiChatSession:
    def __init__(self, model: str, client: Any, system_instruction: str) -> None:
        self.model = model
        self.client = client
        self.system_instruction = system_instruction

    @staticmethod
    def _history_to_contents(history: ConversationHistory) -> list[Any]:
        contents: list[Any] = []
        for message in history.snapshot():
            role = "user" if message.role == "user" else "model"
            contents.append(
                {
                    "role": role,
                    "parts": [{"text": message.content}],
                }
            )
        return contents

    @staticmethod
    def _extract_text(response: Any) -> str:
        text = getattr(response, "text", None)
        if text and str(text).strip():
            return str(text).strip()

        parts: list[str] = []
        for candidate in getattr(response, "candidates", []) or []:
            content = getattr(candidate, "content", None)
            for part in getattr(content, "parts", []) or []:
                piece = getattr(part, "text", "")
                if piece:
                    parts.append(str(piece))

        reply = "".join(parts).strip()
        if not reply:
            raise LLMError("Gemini returned an empty response")
        return reply

    def send_message(self, prompt: str, history: ConversationHistory) -> Any:
        config = None
        if types is not None:
            config = types.GenerateContentConfig(system_instruction=self.system_instruction)
        else:  # pragma: no cover - fallback when types is unavailable
            config = {"system_instruction": self.system_instruction}

        contents = self._history_to_contents(history)
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        response = self.client.models.generate_content(
            model=self.model,
            contents=contents,
            config=config,
        )
        return response


class GeminiConversation:
    def __init__(
        self,
        config: AppConfig,
        history: ConversationHistory | None = None,
        *,
        genai_module: Any | None = None,
    ) -> None:
        self.config = config
        self.history = history or ConversationHistory(max_messages=config.max_history_messages)
        self.genai = genai_module or genai

        if self.config.gemini_api_key.strip():
            if self.genai is None or types is None:
                raise ConfigurationError("google-genai is required for Gemini integration")

            self.client = self.genai.Client(api_key=self.config.gemini_api_key)
            self.chat_session = GeminiChatSession(
                model=self.config.gemini_model,
                client=self.client,
                system_instruction=self.config.system_instruction,
            )

    def clear(self) -> None:
        self.history.clear()

    def _extract_text(self, response: Any) -> str:
        return GeminiChatSession._extract_text(response)

    def send(self, user_text: str) -> GeminiReply:
        if not user_text.strip():
            raise LLMError("User text cannot be empty")
        response = None
        models_to_try = [self.config.gemini_model]
        for fallback_model in DEFAULT_FALLBACK_MODELS:
            if fallback_model not in models_to_try:
                models_to_try.append(fallback_model)

        last_error: Exception | None = None
        for model_name in models_to_try:
            try:
                self.chat_session.model = model_name
                response = self.chat_session.send_message(user_text, self.history)
                break
            except Exception as exc:  # pragma: no cover - external API failure
                last_error = exc
                error_text = str(exc).lower()
                if not any(hint in error_text for hint in RETRYABLE_ERROR_HINTS):
                    break
        if response is None:
            raise LLMError(str(last_error)) from last_error

        reply_text = self._extract_text(response)
        self.history.append_user(user_text)
        self.history.append_assistant(reply_text)

        if self.history.trim():
            self.history.messages = self.history.snapshot()[-self.history.max_messages :]

        return GeminiReply(text=reply_text, raw_response=response)
