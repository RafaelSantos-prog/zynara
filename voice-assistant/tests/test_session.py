from voice_assistant.session import ConversationHistory


def test_history_tracks_messages_and_trims():
    history = ConversationHistory(max_messages=3)
    history.append_user("oi")
    history.append_assistant("olá")
    history.append_user("como vai?")
    history.append_assistant("bem")

    assert history.trim() is True
    assert [message.role for message in history.snapshot()] == ["assistant", "user", "assistant"]


def test_history_converts_to_gemini_roles():
    history = ConversationHistory(max_messages=10)
    history.append_user("bom dia")
    history.append_assistant("bom dia, como posso ajudar?")

    gemini_history = history.to_gemini_history()

    assert gemini_history[0]["role"] == "user"
    assert gemini_history[1]["role"] == "model"
