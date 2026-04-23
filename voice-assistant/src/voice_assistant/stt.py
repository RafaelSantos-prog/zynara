from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    from faster_whisper import WhisperModel
except ImportError:  # pragma: no cover - optional at import time
    WhisperModel = None  # type: ignore[assignment]

from .exceptions import ConfigurationError, TranscriptionError


@dataclass(slots=True)
class TranscriptionSegment:
    start: float
    end: float
    text: str


@dataclass(slots=True)
class TranscriptionResult:
    text: str
    language: str | None
    segments: list[TranscriptionSegment]


class FasterWhisperTranscriber:
    def __init__(
        self,
        *,
        model_size: str = "base",
        device: str = "cpu",
        compute_type: str = "int8",
        whisper_model_cls: Any | None = None,
    ) -> None:
        model_cls = whisper_model_cls or WhisperModel
        if model_cls is None:
            raise ConfigurationError("faster-whisper is required for transcription")

        self.model = model_cls(model_size, device=device, compute_type=compute_type)

    def transcribe_file(self, audio_path: str | Path) -> TranscriptionResult:
        try:
            segments_iter, info = self.model.transcribe(str(audio_path), beam_size=5)
        except Exception as exc:  # pragma: no cover - external model failure
            raise TranscriptionError(str(exc)) from exc

        segments: list[TranscriptionSegment] = []
        texts: list[str] = []
        for segment in segments_iter:
            text = getattr(segment, "text", "").strip()
            texts.append(text)
            segments.append(
                TranscriptionSegment(
                    start=float(getattr(segment, "start", 0.0)),
                    end=float(getattr(segment, "end", 0.0)),
                    text=text,
                )
            )

        return TranscriptionResult(
            text=" ".join(texts).strip(),
            language=getattr(info, "language", None),
            segments=segments,
        )
