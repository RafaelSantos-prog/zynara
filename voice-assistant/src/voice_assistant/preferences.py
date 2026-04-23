from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass(slots=True)
class VoicePreferences:
    audio_input_device: int | str | None = None
    use_vad: bool = True
    silence_threshold: float = 0.015
    silence_seconds: float = 1.0
    audio_player: str = "aplay"


class PreferencesStore:
    def __init__(self, path: str | Path) -> None:
        self.path = Path(path).expanduser()

    def load(self) -> VoicePreferences:
        if not self.path.exists():
            return VoicePreferences()

        try:
            payload = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return VoicePreferences()

        return VoicePreferences(
            audio_input_device=payload.get("audio_input_device"),
            use_vad=bool(payload.get("use_vad", True)),
            silence_threshold=float(payload.get("silence_threshold", 0.015)),
            silence_seconds=float(payload.get("silence_seconds", 1.0)),
            audio_player=str(payload.get("audio_player", "aplay")),
        )

    def save(self, preferences: VoicePreferences) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self.path.with_suffix(self.path.suffix + ".tmp")
        tmp_path.write_text(json.dumps(asdict(preferences), ensure_ascii=False, indent=2), encoding="utf-8")
        tmp_path.replace(self.path)

    def clear(self) -> None:
        if self.path.exists():
            self.path.unlink()
