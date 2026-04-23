from __future__ import annotations

import contextlib
import threading
import time
import wave
from dataclasses import dataclass
from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Any

try:
    import numpy as np
except ImportError:  # pragma: no cover - optional at import time
    np = None  # type: ignore[assignment]

try:
    import sounddevice as sd
except ImportError:  # pragma: no cover - optional at import time
    sd = None  # type: ignore[assignment]

from .exceptions import AudioDeviceError, ConfigurationError


@dataclass(slots=True)
class RecordingResult:
    path: Path
    sample_rate: int
    channels: int
    samples: Any


def _require_numpy():
    if np is None:
        raise ConfigurationError("numpy is required for audio processing")
    return np


def _require_sounddevice():
    if sd is None:
        raise ConfigurationError("sounddevice is required for audio capture")
    return sd


def list_input_devices(sd_module: Any | None = None) -> list[dict[str, Any]]:
    sounddevice_module = sd_module or _require_sounddevice()
    devices = sounddevice_module.query_devices()
    result: list[dict[str, Any]] = []
    for index, device in enumerate(devices):
        if device.get("max_input_channels", 0) > 0:
            result.append(
                {
                    "index": index,
                    "name": device.get("name", f"Input {index}"),
                    "channels": device.get("max_input_channels", 0),
                    "default_samplerate": device.get("default_samplerate"),
                }
            )
    return result


def format_input_devices(devices: list[dict[str, Any]]) -> str:
    if not devices:
        return "Nenhum dispositivo de entrada encontrado."

    lines = ["Dispositivos de entrada disponíveis:"]
    for device in devices:
        lines.append(
            f"- [{device['index']}] {device['name']} "
            f"({device['channels']} canais, {device['default_samplerate']} Hz)"
        )
    return "\n".join(lines)


def convert_float32_to_pcm16(samples: Any) -> bytes:
    np_module = _require_numpy()
    array = np_module.asarray(samples, dtype=np_module.float32)
    if array.ndim > 1:
        array = array.reshape(-1)
    clipped = np_module.clip(array, -1.0, 1.0)
    pcm16 = (clipped * 32767).astype(np_module.int16)
    return pcm16.tobytes()


def trim_silence(
    samples: Any,
    *,
    sample_rate: int,
    threshold: float = 0.01,
    padding_seconds: float = 0.15,
    min_duration_seconds: float = 0.35,
) -> Any:
    np_module = _require_numpy()
    array = np_module.asarray(samples, dtype=np_module.float32)
    if array.size == 0:
        return array

    if array.ndim > 1:
        array = array.reshape(-1)

    if threshold <= 0:
        return array

    frame_size = max(1, int(sample_rate * 0.02))
    active_frames: list[int] = []
    for start in range(0, array.size, frame_size):
        frame = array[start : start + frame_size]
        if frame.size == 0:
            continue
        rms = float(np_module.sqrt(np_module.mean(np_module.square(frame))))
        if rms >= threshold:
            active_frames.append(start)

    if not active_frames:
        return array

    pad_samples = max(0, int(sample_rate * padding_seconds))
    start_index = max(0, active_frames[0] - pad_samples)
    end_index = min(array.size, active_frames[-1] + frame_size + pad_samples)

    min_samples = max(1, int(sample_rate * min_duration_seconds))
    if end_index - start_index < min_samples:
        center = (active_frames[0] + active_frames[-1] + frame_size) // 2
        half = max(min_samples // 2, frame_size)
        start_index = max(0, center - half)
        end_index = min(array.size, start_index + min_samples)
        start_index = max(0, end_index - min_samples)

    return array[start_index:end_index]


def write_wav_file(
    samples: Any,
    *,
    sample_rate: int = 16_000,
    channels: int = 1,
    path: Path | None = None,
) -> Path:
    np_module = _require_numpy()
    pcm_bytes = convert_float32_to_pcm16(samples)
    output_path = path
    if output_path is None:
        temp = NamedTemporaryFile(delete=False, suffix=".wav")
        temp.close()
        output_path = Path(temp.name)

    with wave.open(str(output_path), "wb") as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_bytes)

    return output_path


class PushToTalkRecorder:
    def __init__(
        self,
        *,
        sample_rate: int = 16_000,
        channels: int = 1,
        device: int | str | None = None,
        sd_module: Any | None = None,
        np_module: Any | None = None,
    ) -> None:
        self.sample_rate = sample_rate
        self.channels = channels
        self.device = device
        self.sd = sd_module or sd
        self.np = np_module or np

    def _ensure_dependencies(self) -> None:
        if self.sd is None:
            raise ConfigurationError("sounddevice is required for audio capture")
        if self.np is None:
            raise ConfigurationError("numpy is required for audio capture")

    def capture(self, duration_seconds: float | None = None) -> Any:
        return self.capture_with_options(duration_seconds=duration_seconds)

    def _rms(self, frame: Any) -> float:
        np_module = self.np
        if np_module is None:
            raise ConfigurationError("numpy is required for audio capture")
        array = np_module.asarray(frame, dtype=np_module.float32)
        if array.size == 0:
            return 0.0
        return float(np_module.sqrt(np_module.mean(np_module.square(array))))

    def _resolve_samplerate(self) -> int:
        if self.sample_rate > 0:
            try:
                self.sd.check_input_settings(
                    device=self.device,
                    channels=self.channels,
                    dtype="float32",
                    samplerate=self.sample_rate,
                )
                return self.sample_rate
            except Exception:
                pass

        try:
            device_info = self.sd.query_devices(self.device, "input")
            default_samplerate = int(device_info.get("default_samplerate") or 0)
            if default_samplerate > 0:
                return default_samplerate
        except Exception:
            pass

        return self.sample_rate

    def capture_with_options(
        self,
        duration_seconds: float | None = None,
        *,
        sample_rate: int | None = None,
        use_vad: bool = False,
        silence_threshold: float = 0.015,
        silence_seconds: float = 1.0,
        min_record_seconds: float = 0.6,
        max_record_seconds: float = 20.0,
        trim_threshold: float = 0.01,
        trim_padding_seconds: float = 0.15,
    ) -> Any:
        self._ensure_dependencies()
        frames: list[Any] = []
        stop_event = threading.Event()
        stream_error: list[BaseException] = []
        vad_state = {
            "started": False,
            "last_voice_time": None,
            "start_time": time.monotonic(),
        }
        stream_sample_rate = sample_rate or self._resolve_samplerate()

        def callback(indata, _frames, _time_info, status):  # type: ignore[no-untyped-def]
            if status:
                print(f"[audio] status: {status}")
            frame = indata.copy()
            frames.append(frame)
            if use_vad:
                rms = self._rms(frame)
                if rms >= silence_threshold:
                    vad_state["started"] = True
                    vad_state["last_voice_time"] = time.monotonic()

        def wait_for_stop() -> None:
            try:
                input()
            finally:
                stop_event.set()

        if duration_seconds is None and not use_vad:
            stopper = threading.Thread(target=wait_for_stop, daemon=True)
            stopper.start()

        try:
            with self.sd.InputStream(
                samplerate=stream_sample_rate,
                channels=self.channels,
                dtype="float32",
                device=self.device,
                latency="high",
                callback=callback,
            ):
                if duration_seconds is None:
                    if use_vad:
                        while not stop_event.wait(0.05):
                            now = time.monotonic()
                            elapsed = now - vad_state["start_time"]
                            if elapsed >= max_record_seconds:
                                stop_event.set()
                                break
                            if not vad_state["started"]:
                                continue
                            last_voice_time = vad_state["last_voice_time"]
                            if (
                                last_voice_time is not None
                                and elapsed >= min_record_seconds
                                and (now - last_voice_time) >= silence_seconds
                            ):
                                stop_event.set()
                    else:
                        while not stop_event.wait(0.1):
                            pass
                else:
                    deadline = time.monotonic() + duration_seconds
                    while time.monotonic() < deadline:
                        time.sleep(0.05)
        except Exception as exc:  # pragma: no cover - hardware dependent
            stream_error.append(exc)

        if stream_error:
            raise AudioDeviceError(str(stream_error[0])) from stream_error[0]

        if not frames:
            raise AudioDeviceError("No audio was captured from the input device")

        captured = self.np.concatenate(frames, axis=0).reshape(-1)
        if use_vad:
            captured = trim_silence(
                captured,
                sample_rate=self.sample_rate,
                threshold=trim_threshold,
                padding_seconds=trim_padding_seconds,
            )
        return captured

    def record_to_wav(self, *, duration_seconds: float | None = None, use_vad: bool = False, silence_threshold: float = 0.015, silence_seconds: float = 1.0, min_record_seconds: float = 0.6, max_record_seconds: float = 20.0, trim_threshold: float = 0.01, trim_padding_seconds: float = 0.15) -> RecordingResult:
        stream_sample_rate = self._resolve_samplerate()
        samples = self.capture_with_options(
            duration_seconds=duration_seconds,
            sample_rate=stream_sample_rate,
            use_vad=use_vad,
            silence_threshold=silence_threshold,
            silence_seconds=silence_seconds,
            min_record_seconds=min_record_seconds,
            max_record_seconds=max_record_seconds,
            trim_threshold=trim_threshold,
            trim_padding_seconds=trim_padding_seconds,
        )
        path = write_wav_file(
            samples,
            sample_rate=stream_sample_rate,
            channels=self.channels,
        )
        return RecordingResult(
            path=path,
            sample_rate=stream_sample_rate,
            channels=self.channels,
            samples=samples,
        )

    @contextlib.contextmanager
    def record_context(self, *, duration_seconds: float | None = None, use_vad: bool = False, silence_threshold: float = 0.015, silence_seconds: float = 1.0, min_record_seconds: float = 0.6, max_record_seconds: float = 20.0, trim_threshold: float = 0.01, trim_padding_seconds: float = 0.15):
        result = self.record_to_wav(
            duration_seconds=duration_seconds,
            use_vad=use_vad,
            silence_threshold=silence_threshold,
            silence_seconds=silence_seconds,
            min_record_seconds=min_record_seconds,
            max_record_seconds=max_record_seconds,
            trim_threshold=trim_threshold,
            trim_padding_seconds=trim_padding_seconds,
        )
        try:
            yield result
        finally:
            with contextlib.suppress(FileNotFoundError):
                result.path.unlink()
