from __future__ import annotations

from dataclasses import dataclass
from os import getenv
from pathlib import Path
import os

from .exceptions import ConfigurationError
from .preferences import PreferencesStore, VoicePreferences

SYSTEM_INSTRUCTION = (
    "Você é Zynara, uma assistente de voz criada para oferecer suporte emocional "
    "personalizado, acessível e eticamente rigoroso. Você combina técnicas da "
    "Psicologia Analítica de Carl Jung e da Terapia Cognitivo-Comportamental (TCC).\n\n"
    "PRINCÍPIOS:\n"
    "1. Você nunca substitui um psicólogo humano. Sempre incentive acompanhamento profissional.\n"
    "2. Se identificar risco de vida, forneça imediatamente: CVV 188 ou cvv.org.br.\n"
    "3. Não faça diagnósticos clínicos nem prescreva medicamentos.\n"
    "4. Mantenha sigilo absoluto e não referencie dados de outras conversas.\n\n"
    "METODOLOGIA:\n"
    "- Acolha e calibre o tom com base no histórico.\n"
    "- Use questionamento socrático gentil quando fizer sentido.\n"
    "- Encoraje escrita reflexiva e autonomia psíquica.\n\n"
    "TOM: acolhedor, direto e sem julgamentos. Responda no idioma do usuário.\n"
    "ESTILO DE RESPOSTA: seja clara, objetiva e breve. Use frases curtas, linguagem simples "
    "e evite explicações longas, floreios, metáforas e jargões. Prefira uma ideia por frase. "
    "Quando fizer sentido, limite-se a 3 frases. Se precisar listar opções, use no máximo 3 itens.\n"
    "CALOR HUMANO: fale com ternura, presença e cuidado, como uma figura materna atenta e "
    "segura. Seja carinhosa sem infantilizar, e valide a emoção da pessoa antes de orientar."
)


def _parse_int(value: str | None, default: int) -> int:
    if value is None or value.strip() == "":
        return default
    try:
        return int(value)
    except ValueError as exc:
        raise ConfigurationError(f"Invalid integer value: {value!r}") from exc


def _parse_float(value: str | None) -> float | None:
    if value is None or value.strip() == "":
        return None
    try:
        return float(value)
    except ValueError as exc:
        raise ConfigurationError(f"Invalid float value: {value!r}") from exc


def _parse_float_or_default(value: str | None, default: float) -> float:
    parsed = _parse_float(value)
    return default if parsed is None else parsed


def _parse_device(value: str | None) -> int | str | None:
    if value is None or value.strip() == "":
        return None
    try:
        return int(value)
    except ValueError:
        return value


def _parse_bool(value: str | None, default: bool = False) -> bool:
    if value is None or value.strip() == "":
        return default
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ConfigurationError(f"Invalid boolean value: {value!r}")


def _load_env_file(path: Path, *, override: bool = False) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].lstrip()
        if "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if not key:
            continue
        if key in os.environ and (not override or value == ""):
            continue

        if value and value[0] == value[-1] and value[0] in {'"', "'"}:
            value = value[1:-1]

        os.environ[key] = value


def load_shared_environment() -> None:
    repo_root = Path(__file__).resolve().parents[3]
    _load_env_file(repo_root / ".env", override=True)
    _load_env_file(repo_root / "voice-assistant" / ".env", override=True)


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _resolve_repo_relative_path(value: str, *, must_exist: bool = False) -> str:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = _repo_root() / path
    if must_exist and not path.exists():
        raise ConfigurationError(f"Path does not exist: {path}")
    return str(path)


def _resolve_piper_binary_path(value: str) -> str:
    path = Path(value).expanduser()
    if path.is_absolute():
        return str(path)

    repo_root = _repo_root()
    candidates = [
        repo_root / "voice-assistant" / path,
        repo_root / path,
        repo_root / "voice-assistant" / ".venv" / "bin" / "piper" if value == "piper" else None,
    ]

    for candidate in candidates:
        if candidate is None:
            continue
        if candidate.exists():
            return str(candidate)

    # Fall back to the most likely local path so callers still get a useful error
    # from the runtime if the binary is missing.
    return str(repo_root / "voice-assistant" / path)


def _resolve_preferences_path() -> Path:
    configured = getenv("VOICE_ASSISTANT_PREFS_PATH")
    if configured:
        return Path(configured).expanduser()
    return Path.home() / ".config" / "zynara" / "voice-assistant" / "preferences.json"


@dataclass(slots=True)
class AppConfig:
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    piper_binary: str = "piper"
    piper_model_path: str = ""
    audio_player: str = "aplay"
    audio_input_device: int | str | None = None
    max_history_messages: int = 24
    record_seconds: float | None = None
    history_path: str | None = None
    preferences_path: str | None = None
    sample_rate: int = 16_000
    channels: int = 1
    whisper_model_size: str = "base"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"
    speak_responses: bool = True
    use_vad: bool = True
    silence_threshold: float = 0.015
    silence_seconds: float = 1.0
    min_record_seconds: float = 0.6
    max_record_seconds: float = 20.0

    @property
    def system_instruction(self) -> str:
        return SYSTEM_INSTRUCTION

    @classmethod
    def from_env(
        cls,
        *,
        speak_responses: bool = True,
        record_seconds: float | None = None,
        audio_input_device: int | str | None = None,
        use_vad: bool | None = None,
    ) -> "AppConfig":
        load_shared_environment()
        preferences_store = PreferencesStore(_resolve_preferences_path())
        preferences = preferences_store.load()

        gemini_api_key = getenv("GEMINI_API_KEY", "").strip()
        if not gemini_api_key:
            raise ConfigurationError("GEMINI_API_KEY is required")

        piper_binary = getenv("PIPER_BINARY", "piper")
        piper_model_path = getenv("PIPER_MODEL_PATH", "").strip()
        if speak_responses and not piper_model_path:
            raise ConfigurationError("PIPER_MODEL_PATH is required when TTS is enabled")
        if piper_binary.strip():
            piper_binary = _resolve_piper_binary_path(piper_binary)
        if piper_model_path:
            piper_model_path = _resolve_repo_relative_path(piper_model_path)

        return cls(
            gemini_api_key=gemini_api_key,
            gemini_model=getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            piper_binary=piper_binary,
            piper_model_path=piper_model_path,
            audio_player=getenv("AUDIO_PLAYER", preferences.audio_player),
            audio_input_device=_parse_device(
                getenv("AUDIO_INPUT_DEVICE")
                if audio_input_device is None
                else str(audio_input_device)
            )
            if getenv("AUDIO_INPUT_DEVICE") or audio_input_device is not None
            else preferences.audio_input_device,
            max_history_messages=_parse_int(getenv("MAX_HISTORY_MESSAGES"), 24),
            record_seconds=record_seconds if record_seconds is not None else _parse_float(getenv("VOICE_ASSISTANT_RECORD_SECONDS")),
            history_path=getenv("VOICE_ASSISTANT_HISTORY_PATH")
            or str(Path.home() / ".config" / "zynara" / "voice-assistant" / "history.json"),
            preferences_path=str(_resolve_preferences_path()),
            whisper_model_size=getenv("VOICE_ASSISTANT_WHISPER_MODEL_SIZE", "base"),
            whisper_device=getenv("VOICE_ASSISTANT_WHISPER_DEVICE", "cpu"),
            whisper_compute_type=getenv("VOICE_ASSISTANT_WHISPER_COMPUTE_TYPE", "int8"),
            speak_responses=speak_responses,
            use_vad=use_vad if use_vad is not None else _parse_bool(getenv("VOICE_ASSISTANT_USE_VAD"), preferences.use_vad),
            silence_threshold=_parse_float_or_default(getenv("VOICE_ASSISTANT_SILENCE_THRESHOLD"), preferences.silence_threshold),
            silence_seconds=_parse_float_or_default(getenv("VOICE_ASSISTANT_SILENCE_SECONDS"), preferences.silence_seconds),
            min_record_seconds=_parse_float_or_default(getenv("VOICE_ASSISTANT_MIN_RECORD_SECONDS"), 0.6),
            max_record_seconds=_parse_float_or_default(getenv("VOICE_ASSISTANT_MAX_RECORD_SECONDS"), 20.0),
        )
