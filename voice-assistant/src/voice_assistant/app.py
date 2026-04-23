from __future__ import annotations

import argparse
import sys
from os import getenv

from .audio import (
    PushToTalkRecorder,
    format_input_devices,
    list_input_devices,
)
from .config import AppConfig
from .exceptions import VoiceAssistantError
from .llm import GeminiConversation
from .session import ConversationHistory
from .storage import HistoryStore
from .preferences import PreferencesStore, VoicePreferences
from .stt import FasterWhisperTranscriber
from .tts import PiperTTS


class VoiceAssistantApp:
    def __init__(
        self,
        config: AppConfig,
        *,
        recorder: PushToTalkRecorder | None = None,
        transcriber: FasterWhisperTranscriber | None = None,
        conversation: GeminiConversation | None = None,
        tts: PiperTTS | None = None,
        history_store: HistoryStore | None = None,
        preferences_store: PreferencesStore | None = None,
        stdout = print,
    ) -> None:
        self.config = config
        self.stdout = stdout
        self.history_store = history_store or HistoryStore(config.history_path)
        self.preferences_store = preferences_store or PreferencesStore(config.preferences_path)
        self.recorder = recorder or PushToTalkRecorder(
            sample_rate=config.sample_rate,
            channels=config.channels,
            device=config.audio_input_device,
        )
        self.transcriber = transcriber or FasterWhisperTranscriber(
            model_size=config.whisper_model_size,
            device=config.whisper_device,
            compute_type=config.whisper_compute_type,
        )
        if conversation is None:
            self.history = self.history_store.load(config.max_history_messages)
            self.conversation = GeminiConversation(config, history=self.history)
        else:
            self.conversation = conversation
            self.history = conversation.history
        self.tts = tts
        if self.tts is None and config.speak_responses:
            self.tts = PiperTTS(
                piper_binary=config.piper_binary,
                model_path=config.piper_model_path,
                audio_player=config.audio_player,
            )
        self._save_preferences()

    def clear_history(self) -> None:
        self.conversation.clear()
        self.history_store.clear()
        self.stdout("[session] histórico limpo")

    def _save_preferences(self) -> None:
        try:
            self.preferences_store.save(
                VoicePreferences(
                    audio_input_device=self.config.audio_input_device,
                    use_vad=self.config.use_vad,
                    silence_threshold=self.config.silence_threshold,
                    silence_seconds=self.config.silence_seconds,
                    audio_player=self.config.audio_player,
                )
            )
        except VoiceAssistantError:
            raise
        except Exception:
            pass

    def _set_audio_input_device(self, device: int | str | None) -> None:
        self.config.audio_input_device = device
        self.recorder.device = device
        self._save_preferences()
        self.stdout(f"[prefs] microfone definido para: {device if device is not None else 'padrão do sistema'}")

    def _set_use_vad(self, enabled: bool) -> None:
        self.config.use_vad = enabled
        self._save_preferences()
        self.stdout(f"[prefs] VAD {'ativado' if enabled else 'desativado'}")

    def _show_preferences(self) -> None:
        self.stdout("[prefs] configurações atuais:")
        self.stdout(f"- microfone: {self.config.audio_input_device if self.config.audio_input_device is not None else 'padrão do sistema'}")
        self.stdout(f"- VAD: {'on' if self.config.use_vad else 'off'}")
        self.stdout(f"- player: {self.config.audio_player}")
        self.stdout(f"- silêncio: threshold={self.config.silence_threshold}, seconds={self.config.silence_seconds}")

    def list_devices(self) -> None:
        devices = list_input_devices()
        self.stdout(format_input_devices(devices))

    def _handle_reply(self, transcript: str) -> str:
        reply = self.conversation.send(transcript)
        self.history_store.save(self.history)
        self.stdout("")
        self.stdout(f"Você: {transcript}")
        self.stdout(f"Zynara: {reply.text}")

        if self.tts is not None:
            self.tts.speak(reply.text)

        return reply.text

    def process_transcript(self, transcript: str) -> str | None:
        cleaned = transcript.strip()
        if not cleaned:
            return None
        try:
            return self._handle_reply(cleaned)
        except VoiceAssistantError as exc:
            self.stdout(f"[erro] {exc}")
            return None

    def record_and_respond(self, *, duration_seconds: float | None = None) -> str | None:
        if duration_seconds is None:
            if self.config.use_vad:
                self.stdout("Fale agora. O silêncio encerra a gravação.")
            else:
                self.stdout("Pressione Enter para começar e Enter novamente para parar a gravação.")
        else:
            self.stdout(f"Gravando por {duration_seconds} segundos.")
        result = None
        try:
            result = self.recorder.record_to_wav(
                duration_seconds=duration_seconds,
                use_vad=self.config.use_vad,
                silence_threshold=self.config.silence_threshold,
                silence_seconds=self.config.silence_seconds,
                min_record_seconds=self.config.min_record_seconds,
                max_record_seconds=self.config.max_record_seconds,
            )
            transcript_result = self.transcriber.transcribe_file(result.path)
            if not transcript_result.text.strip():
                self.stdout("[stt] Nenhuma fala detectada.")
                return None
            self.stdout(f"[stt] idioma detectado: {transcript_result.language or 'desconhecido'}")
            return self.process_transcript(transcript_result.text)
        finally:
            if result is not None and result.path.exists():
                result.path.unlink(missing_ok=True)

    def run_once(self, *, duration_seconds: float | None = None) -> int:
        try:
            self.record_and_respond(duration_seconds=duration_seconds)
            return 0
        except VoiceAssistantError as exc:
            self.stdout(f"[erro] {exc}")
            return 1

    def run_interactive(self, *, duration_seconds: float | None = None) -> int:
        mode = "VAD" if self.config.use_vad and duration_seconds is None else "push-to-talk"
        self.stdout(
            f"Zynara pronta. Modo atual: {mode}. Comandos: Enter para voz, /clear, /devices, /prefs, /device <id>, /vad on|off, /quit"
        )
        while True:
            try:
                command = input("zynara> ").strip()
            except (EOFError, KeyboardInterrupt):
                self.stdout("")
                break

            if command in {"/quit", "/exit"}:
                break
            if command == "/clear":
                self.clear_history()
                continue
            if command == "/devices":
                self.list_devices()
                continue
            if command == "/prefs":
                self._show_preferences()
                continue
            if command.startswith("/device"):
                parts = command.split(maxsplit=1)
                if len(parts) == 1 or not parts[1].strip():
                    self._set_audio_input_device(None)
                else:
                    raw_device = parts[1].strip()
                    try:
                        self._set_audio_input_device(int(raw_device))
                    except ValueError:
                        self._set_audio_input_device(raw_device)
                continue
            if command.startswith("/vad"):
                parts = command.split(maxsplit=1)
                if len(parts) == 1:
                    self._show_preferences()
                    continue
                value = parts[1].strip().lower()
                if value in {"on", "true", "1", "yes"}:
                    self._set_use_vad(True)
                elif value in {"off", "false", "0", "no"}:
                    self._set_use_vad(False)
                else:
                    self.stdout("[prefs] use /vad on ou /vad off")
                continue
            if command:
                self.process_transcript(command)
                continue

            try:
                self.record_and_respond(duration_seconds=duration_seconds)
            except VoiceAssistantError as exc:
                self.stdout(f"[erro] {exc}")

        return 0


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Zynara voice assistant")
    parser.add_argument("--once", action="store_true", help="Record one turn and exit")
    parser.add_argument("--list-devices", action="store_true", help="List input devices and exit")
    parser.add_argument("--say", type=str, default=None, help="Speak the given text with Piper and exit")
    parser.add_argument("--record-seconds", type=float, default=None, help="Record with a fixed duration instead of push-to-talk")
    parser.add_argument("--no-tts", action="store_true", help="Disable Piper playback")
    parser.add_argument("--no-vad", action="store_true", help="Disable silence-based auto-stop")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_argument_parser()
    args = parser.parse_args(argv)

    if args.list_devices:
        try:
            devices = list_input_devices()
            print(format_input_devices(devices))
            return 0
        except VoiceAssistantError as exc:
            print(f"[erro] {exc}")
            return 1

    if args.say is not None:
        try:
            from .config import load_shared_environment

            load_shared_environment()
            piper_binary = getenv("PIPER_BINARY", "piper")
            piper_model_path = getenv("PIPER_MODEL_PATH", "").strip()
            audio_player = getenv("AUDIO_PLAYER", "aplay")
            if not piper_model_path:
                raise VoiceAssistantError("PIPER_MODEL_PATH is required for TTS testing")

            tts = PiperTTS(
                piper_binary=piper_binary,
                model_path=piper_model_path,
                audio_player=audio_player,
            )
            print(f"[tts] reproduzindo teste de voz com {piper_model_path}")
            tts.speak(args.say)
            return 0
        except VoiceAssistantError as exc:
            print(f"[erro] {exc}")
            return 1

    try:
        config = AppConfig.from_env(
            speak_responses=not args.no_tts,
            record_seconds=args.record_seconds,
            use_vad=False if args.no_vad else None,
        )
        app = VoiceAssistantApp(config)
    except VoiceAssistantError as exc:
        print(f"[erro] {exc}")
        return 1

    duration_seconds = args.record_seconds if args.record_seconds is not None else config.record_seconds
    if args.once:
        return app.run_once(duration_seconds=duration_seconds)
    return app.run_interactive(duration_seconds=duration_seconds)
