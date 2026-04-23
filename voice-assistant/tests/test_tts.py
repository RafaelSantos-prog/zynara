from __future__ import annotations

from dataclasses import dataclass

import pytest

from voice_assistant.exceptions import ConfigurationError
from voice_assistant.tts import PiperTTS


@dataclass
class FakeProcess:
    command: list[str]
    stdin: object | None = None
    stdout: object | None = None
    stderr: object | None = None
    returncode: int = 0
    payload: bytes = b""

    def communicate(self, input=None):  # noqa: A002
        if input is not None:
            self.payload = input
        if "--output-raw" in self.command or "--output_stdout" in self.command:
            return b"raw-audio", b""
        return b"", b""


class FakePopen:
    def __init__(self):
        self.calls: list[list[str]] = []
        self.processes: list[FakeProcess] = []

    def __call__(self, command, **kwargs):
        process = FakeProcess(command=list(command), **kwargs)
        self.calls.append(list(command))
        self.processes.append(process)
        return process


def test_tts_builds_piper_and_player_commands():
    popen = FakePopen()
    tts = PiperTTS(
        piper_binary="/usr/local/bin/piper",
        model_path="/tmp/voice.onnx",
        audio_player="aplay",
        popen=popen,
    )

    tts.speak("Olá mundo")

    assert popen.calls[0][:3] == ["/usr/local/bin/piper", "--model", "/tmp/voice.onnx"]
    assert popen.calls[0][3] == "--output-raw"
    assert popen.calls[1][:5] == ["aplay", "-q", "-f", "S16_LE", "-r"]
    assert popen.processes[0].payload == b"Ol\xc3\xa1 mundo\n"


def test_tts_strips_markdown_for_speech():
    popen = FakePopen()
    tts = PiperTTS(
        piper_binary="/usr/local/bin/piper",
        model_path="/tmp/voice.onnx",
        audio_player="aplay",
        popen=popen,
    )

    tts.speak("3. **Instinto:**\n* É um impulso natural.\n[site](https://example.com)")

    assert popen.processes[0].payload == "Instinto: É um impulso natural. site\n".encode("utf-8")


def test_tts_requires_model_path():
    with pytest.raises(ConfigurationError):
        PiperTTS(piper_binary="piper", model_path="", audio_player="aplay")
