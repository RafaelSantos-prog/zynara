from __future__ import annotations

import re
import shlex
import shutil
import subprocess
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

from .exceptions import ConfigurationError, TTSExecutionError


def _normalize_command(command: str) -> list[str]:
    return shlex.split(command) if command else []


def _clean_speech_text(text: str) -> str:
    lines: list[str] = []
    for raw_line in text.replace("\r\n", "\n").replace("\r", "\n").split("\n"):
        line = raw_line.strip()
        if not line:
            continue

        line = re.sub(r"^\s*(?:[-*+•]|\d+[.)])\s+", "", line)
        line = re.sub(r"^\s{0,3}#{1,6}\s*", "", line)
        line = re.sub(r"^\s*>\s?", "", line)
        line = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", line)
        line = line.replace("```", "").replace("`", "")
        line = re.sub(r"[*_~]", "", line)
        line = re.sub(r"\s+([.,;:!?])", r"\1", line)
        line = re.sub(r"\s{2,}", " ", line).strip()

        if line:
            lines.append(line)

    cleaned = " ".join(lines).strip()
    cleaned = re.sub(r"\s+([.,;:!?])", r"\1", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
    return cleaned


def _default_player_command(player: str) -> list[str]:
    player = player.strip()
    if not player:
        raise ConfigurationError("An audio player command is required for Piper playback")

    known = {
        "aplay": ["aplay", "-q"],
        "paplay": ["paplay"],
        "ffplay": ["ffplay", "-autoexit", "-nodisp", "-loglevel", "error", "-i", "pipe:0"],
    }

    if player in known:
        return known[player]

    if shutil.which(player):
        return [player]

    return _normalize_command(player)


@dataclass(slots=True)
class PiperTTS:
    piper_binary: str
    model_path: str
    audio_player: str = "aplay"
    popen: Callable[..., subprocess.Popen] = subprocess.Popen

    def __post_init__(self) -> None:
        if not self.model_path:
            raise ConfigurationError("Piper model path is required")

    def _model_sample_rate(self) -> int:
        config_path = Path(f"{self.model_path}.json")
        if not config_path.exists():
            return 22050

        try:
            payload = json.loads(config_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return 22050

        audio = payload.get("audio", {}) if isinstance(payload, dict) else {}
        sample_rate = audio.get("sample_rate") if isinstance(audio, dict) else None
        try:
            return int(sample_rate)
        except (TypeError, ValueError):
            return 22050

    def _build_piper_command(self) -> list[str]:
        binary = self.piper_binary.strip()
        if not binary:
            raise ConfigurationError("Piper binary is required")

        if binary == "piper":
            repo_root = Path(__file__).resolve().parents[3]
            candidates: list[str] = [
                binary,
                str(repo_root / "voice-assistant" / ".venv" / "bin" / "piper"),
                str(Path.home() / ".local" / "bin" / "piper"),
            ]
        else:
            return [binary, "--model", self.model_path, "--output-raw"]

        for candidate in candidates:
            if shutil.which(candidate) or Path(candidate).exists():
                return [candidate, "--model", self.model_path, "--output-raw"]

        raise ConfigurationError(f"Piper binary not found: {binary}")

    def _build_player_command(self) -> list[str]:
        command = _default_player_command(self.audio_player)
        sample_rate = self._model_sample_rate()

        if command and command[0] == "aplay":
            return ["aplay", "-q", "-f", "S16_LE", "-r", str(sample_rate), "-t", "raw"]
        if command and command[0] == "paplay":
            return ["paplay", "--raw", f"--rate={sample_rate}", "--channels=1", "--format=s16le"]
        if command and command[0] == "ffplay":
            return [
                "ffplay",
                "-autoexit",
                "-nodisp",
                "-loglevel",
                "error",
                "-f",
                "s16le",
                "-ar",
                str(sample_rate),
                "-ac",
                "1",
                "-i",
                "pipe:0",
            ]

        if not command:
            raise ConfigurationError("Audio player command could not be resolved")
        return command

    def speak(self, text: str) -> None:
        cleaned_text = _clean_speech_text(text)
        if not cleaned_text:
            return

        piper_command = self._build_piper_command()
        player_command = self._build_player_command()

        try:
            piper_process = self.popen(
                piper_command,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
            )
            audio_bytes, piper_stderr = piper_process.communicate(input=(cleaned_text + "\n").encode("utf-8"))
        except OSError as exc:  # pragma: no cover - system dependent
            raise TTSExecutionError(str(exc)) from exc

        if piper_process.returncode not in (0, None):
            stderr_text = (piper_stderr or b"").decode("utf-8", errors="replace").strip()
            raise TTSExecutionError(stderr_text or "Piper execution failed")

        if not audio_bytes:
            stderr_text = (piper_stderr or b"").decode("utf-8", errors="replace").strip()
            if stderr_text:
                raise TTSExecutionError(f"Piper returned no audio output: {stderr_text}")
            raise TTSExecutionError("Piper returned no audio output")

        try:
            player_process = self.popen(
                player_command,
                stdin=subprocess.PIPE,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
            )
            _, player_stderr = player_process.communicate(input=audio_bytes)
        except OSError as exc:  # pragma: no cover - system dependent
            raise TTSExecutionError(str(exc)) from exc

        if player_process.returncode not in (0, None):
            stderr_text = (player_stderr or b"").decode("utf-8", errors="replace").strip()
            raise TTSExecutionError(stderr_text or "Audio playback failed")
