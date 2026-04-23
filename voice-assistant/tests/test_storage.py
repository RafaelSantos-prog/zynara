from __future__ import annotations

from voice_assistant.session import ConversationHistory
from voice_assistant.storage import HistoryStore


def test_history_store_saves_and_loads(tmp_path):
    store = HistoryStore(tmp_path / "history.json")
    history = ConversationHistory(max_messages=10)
    history.append_user("oi")
    history.append_assistant("olá")

    store.save(history)
    loaded = store.load(max_messages=10)

    assert [message.role for message in loaded.messages] == ["user", "assistant"]
    assert [message.content for message in loaded.messages] == ["oi", "olá"]


def test_history_store_clear(tmp_path):
    store = HistoryStore(tmp_path / "history.json")
    history = ConversationHistory(max_messages=10)
    history.append_user("oi")
    store.save(history)

    store.clear()

    assert not (tmp_path / "history.json").exists()
