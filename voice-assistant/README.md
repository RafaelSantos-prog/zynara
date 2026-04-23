# Zynara Voice Assistant

Assistente de voz local em Python com:

- STT com `faster-whisper`
- LLM com Gemini via `google-generativeai`
- TTS com Piper executado como processo externo e limpeza de Markdown antes da fala
- captura de microfone com `sounddevice`
- respostas pensadas para serem diretas, claras e curtas
- VAD com corte de silêncio nas bordas para não perder o começo da fala
- fallback para a taxa nativa do microfone quando 16 kHz não é suportado

## Requisitos do sistema

No Linux, instale dependências de áudio antes do `pip`:

```bash
sudo apt update
sudo apt install -y portaudio19-dev alsa-utils ffmpeg
```

Se o `sounddevice` não detectar microfone, rode:

```bash
python -m voice_assistant --list-devices
```

Ou:

```bash
make devices
```

## Instalação

```bash
cd voice-assistant
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Instalação de tudo a partir da raiz do projeto:

```bash
make install-all
```

Ou:

```bash
npm run install:all
```

## Configuração de ambiente

Copie o `.env.example` da raiz do repositório para `.env`.

Esse arquivo raiz pode ser consumido por:

- frontend, via `VITE_` e `envDir` do Vite
- backend, via `dotenv`
- voice-assistant, via loader compartilhado de ambiente

Variáveis principais:

- `GEMINI_API_KEY`: chave do Gemini usada pelo assistente de voz
- `GEMINI_MODEL`: padrão `gemini-2.5-flash`
- `PIPER_BINARY`: caminho para o binário `piper`
- `PIPER_MODEL_PATH`: caminho para o modelo ONNX da voz
- `AUDIO_PLAYER`: `aplay`, `paplay` ou `ffplay`
- `AUDIO_INPUT_DEVICE`: nome ou índice do microfone, opcional
- `MAX_HISTORY_MESSAGES`: janela local do histórico da conversa
- `VOICE_ASSISTANT_PREFS_PATH`: arquivo JSON para persistir microfone e VAD
- `VOICE_ASSISTANT_HISTORY_PATH`: arquivo JSON para persistir o chat
- `VOICE_ASSISTANT_WHISPER_MODEL_SIZE`: tamanho do modelo do Whisper, como `tiny`, `base`, `small`, `medium`, `large-v3`
- `VOICE_ASSISTANT_WHISPER_DEVICE`: dispositivo de inferência, normalmente `cpu` ou `cuda`
- `VOICE_ASSISTANT_WHISPER_COMPUTE_TYPE`: tipo de computação do Whisper, por exemplo `int8`, `float16` ou `float32`

Exemplo:

```bash
export GEMINI_API_KEY="sua-chave"
export PIPER_BINARY="$HOME/bin/piper"
export PIPER_MODEL_PATH="$HOME/voices/pt_BR.onnx"
export AUDIO_PLAYER="aplay"
```

O assistente lê o `.env` da raiz do repositório e também aceita um `voice-assistant/.env` local para sobrescrever apenas as variáveis do assistente de voz, se você quiser testar algo sem mexer no arquivo principal.

### Configurar o Whisper

O STT do assistente usa `faster-whisper`. Para trocar o modelo ou acelerar a transcrição, ajuste estas variáveis:

```env
VOICE_ASSISTANT_WHISPER_MODEL_SIZE=base
VOICE_ASSISTANT_WHISPER_DEVICE=cpu
VOICE_ASSISTANT_WHISPER_COMPUTE_TYPE=int8
```

Sugestões rápidas:

- `tiny` ou `base`: melhor para máquinas mais modestas
- `small` ou `medium`: melhor equilíbrio entre qualidade e velocidade
- `large-v3`: melhor qualidade, mas exige mais recurso
- `int8`: costuma funcionar bem em CPU
- `float16`: costuma ser melhor em GPU compatível

## Piper

Baixe o binário oficial do Piper e um modelo de voz em português do projeto `rhasspy/piper`.

Uma opção PT-BR boa para começar é `pt_BR-cadu-medium`, disponível no catálogo oficial de vozes.

Se o seu sistema bloquear instalação global de Python com erro `externally-managed-environment`, use a venv do próprio projeto:

```bash
cd voice-assistant
.venv/bin/pip install piper-tts
```

Depois, o executável normalmente fica em:

```bash
.venv/bin/piper
```

Fluxo esperado:

```bash
echo "Olá" | ./piper --model modelo.onnx --output-raw | aplay -q -f S16_LE -r 22050 -t raw
```

O projeto usa exatamente essa estratégia por baixo dos panos via `subprocess.Popen`.

Exemplo de download manual no Linux:

```bash
mkdir -p "$HOME/voices/piper/pt_BR-cadu-medium"
cd "$HOME/voices/piper/pt_BR-cadu-medium"
curl -L -O https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/cadu/medium/pt_BR-cadu-medium.onnx
curl -L -O https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/cadu/medium/pt_BR-cadu-medium.onnx.json
```

Depois ajuste o `.env`:

```bash
PIPER_BINARY=.venv/bin/piper
PIPER_MODEL_PATH=$HOME/voices/piper/pt_BR-cadu-medium/pt_BR-cadu-medium.onnx
AUDIO_PLAYER=aplay
```

Para testar só a voz, sem microfone e sem Gemini:

```bash
python -m voice_assistant --say "Olá, eu sou a Zynara."
```

Ou:

```bash
make tts-test TEXT="Olá, eu sou a Zynara."
```

Na raiz do repositório, também funciona:

```bash
npm run voice:tts-test
```

## Uso

Modo interativo:

```bash
python -m voice_assistant
```

Ou:

```bash
make run
```

Comandos úteis:

- `Enter` vazio: grava um turno de voz
- `/clear`: limpa o histórico
- `/devices`: lista dispositivos de entrada
- `/quit`: encerra

Modo captura única:

```bash
python -m voice_assistant --once
```

Ou:

```bash
make once
```

Também é possível gravar por tempo fixo:

```bash
python -m voice_assistant --once --record-seconds 5
```

Se quiser testar apenas captura, STT e Gemini, sem reproduzir voz:

```bash
python -m voice_assistant --no-tts
```

Silêncio como auto-stop:

```bash
python -m voice_assistant --no-vad
```

Durante a execução interativa:

- `/prefs` mostra as preferências atuais
- `/device <id|nome>` altera e salva o microfone
- `/vad on|off` ativa ou desativa o auto-stop por silêncio

## Estrutura

- `src/voice_assistant/audio.py`: captura e serialização de áudio
- `src/voice_assistant/stt.py`: Faster-Whisper
- `src/voice_assistant/llm.py`: Gemini e sessão de chat
- `src/voice_assistant/tts.py`: Piper via subprocess
- `src/voice_assistant/app.py`: orquestração do fluxo

## Testes

```bash
pytest
```

Os testes usam `mocks` para evitar dependência de microfone, Gemini e Piper reais.
