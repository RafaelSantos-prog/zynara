class VoiceAssistantError(Exception):
    """Base exception for the voice assistant."""


class ConfigurationError(VoiceAssistantError):
    """Raised when required configuration is missing or invalid."""


class AudioDeviceError(VoiceAssistantError):
    """Raised when audio capture cannot be initialized."""


class TranscriptionError(VoiceAssistantError):
    """Raised when audio transcription fails."""


class LLMError(VoiceAssistantError):
    """Raised when Gemini integration fails."""


class TTSExecutionError(VoiceAssistantError):
    """Raised when Piper playback fails."""
