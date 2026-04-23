from __future__ import annotations

import json
from dataclasses import asdict
from pathlib import Path

from .session import ConversationHistory, ChatMessage


class HistoryStore:
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path).expanduser()

    def load(self, max_messages: int) -> ConversationHistory:
        history = ConversationHistory(max_messages=max_messages)
        if not self.path.exists():
            return history

        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return history

        messages = payload.get("messages", [])
        for item in messages:
            role = item.get("role")
            content = item.get("content", "")
            if role == "user":
                history.messages.append(ChatMessage(role="user", content=content))
            elif role == "assistant":
                history.messages.append(ChatMessage(role="assistant", content=content))

        history.trim()
        return history

    def save(self, history: ConversationHistory) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "messages": [asdict(message) for message in history.snapshot()],
        }
        tmp_path = self.path.with_suffix(self.path.suffix + ".tmp")
        tmp_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp_path.replace(self.path)

    def clear(self) -> None:
        if self.path.exists():
            self.path.unlink()
