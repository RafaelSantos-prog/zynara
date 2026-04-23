from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal


Role = Literal["user", "assistant"]


@dataclass(slots=True)
class ChatMessage:
    role: Role
    content: str


@dataclass
class ConversationHistory:
    max_messages: int = 24
    messages: list[ChatMessage] = field(default_factory=list)

    def append_user(self, content: str) -> None:
        self.messages.append(ChatMessage(role="user", content=content))

    def append_assistant(self, content: str) -> None:
        self.messages.append(ChatMessage(role="assistant", content=content))

    def clear(self) -> None:
        self.messages.clear()

    def trim(self) -> bool:
        if self.max_messages <= 0:
            return False

        if len(self.messages) <= self.max_messages:
            return False

        self.messages = self.messages[-self.max_messages :]
        return True

    def to_gemini_history(self) -> list[dict[str, object]]:
        gemini_history: list[dict[str, object]] = []
        for message in self.messages:
            role = "user" if message.role == "user" else "model"
            gemini_history.append(
                {
                    "role": role,
                    "parts": [{"text": message.content}],
                }
            )
        return gemini_history

    def snapshot(self) -> list[ChatMessage]:
        return list(self.messages)
