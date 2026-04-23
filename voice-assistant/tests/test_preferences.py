from __future__ import annotations

from voice_assistant.preferences import PreferencesStore, VoicePreferences


def test_preferences_store_saves_and_loads(tmp_path):
    store = PreferencesStore(tmp_path / "prefs.json")
    prefs = VoicePreferences(
        audio_input_device=3,
        use_vad=False,
        silence_threshold=0.02,
        silence_seconds=1.5,
        audio_player="paplay",
    )

    store.save(prefs)
    loaded = store.load()

    assert loaded.audio_input_device == 3
    assert loaded.use_vad is False
    assert loaded.silence_threshold == 0.02
    assert loaded.silence_seconds == 1.5
    assert loaded.audio_player == "paplay"
