from __future__ import annotations

import pytest

from voice_assistant import audio


pytest.importorskip("numpy")


def test_convert_float32_to_pcm16_produces_bytes():
    np = pytest.importorskip("numpy")
    samples = np.array([0.0, 0.5, -0.5], dtype=np.float32)

    pcm = audio.convert_float32_to_pcm16(samples)

    assert isinstance(pcm, (bytes, bytearray))
    assert len(pcm) == 6


def test_trim_silence_removes_edges_but_keeps_voice():
    np = pytest.importorskip("numpy")
    samples = np.concatenate(
        [
            np.zeros(1600, dtype=np.float32),
            np.full(800, 0.02, dtype=np.float32),
            np.zeros(1600, dtype=np.float32),
        ]
    )

    trimmed = audio.trim_silence(samples, sample_rate=16_000, threshold=0.01)

    assert trimmed.size < samples.size
    assert trimmed.size > 0
    assert float(np.max(trimmed)) >= 0.02


def test_resolve_samplerate_falls_back_to_device_default():
    np = pytest.importorskip("numpy")

    class FakeSD:
        def check_input_settings(self, **kwargs):
            raise RuntimeError("unsupported")

        def query_devices(self, device, kind):
            return {"default_samplerate": 48000}

    recorder = audio.PushToTalkRecorder(
        sample_rate=16000,
        channels=1,
        sd_module=FakeSD(),
        np_module=np,
    )

    assert recorder._resolve_samplerate() == 48000
