# Zynara

Zynara é um monorepo com três partes principais:

- `frontend`: interface web em React + Vite
- `backend`: API em Node.js + Express + Prisma
- `voice-assistant`: assistente de voz local em Python com STT, Gemini e Piper

A ideia do projeto é unir uma experiência web com uma camada conversacional e um assistente de voz local, mantendo a configuração centralizada em um único `.env` na raiz do repositório.

## Visão Geral

Fluxo principal:

1. O frontend exibe a experiência do usuário.
2. O backend expõe autenticação, chat, pagamento simulado e integração com banco.
3. O voice assistant captura áudio, transcreve localmente com Faster-Whisper, conversa com Gemini e fala com Piper.

## Estrutura

- [`frontend/`](./frontend): app React com páginas, stores, hooks e i18n
- [`backend/`](./backend): API Express, Prisma e integrações auxiliares
- [`voice-assistant/`](./voice-assistant): CLI Python com STT, LLM, TTS e persistência local
- [`scripts/dev-all.mjs`](./scripts/dev-all.mjs): orquestrador para subir tudo junto
- [`Makefile`](./Makefile): atalhos de instalação, execução e voz
- [`HOSTING.md`](./HOSTING.md): guia prático de hospedagem e opções de LLM
- [`.env`](./.env): configuração compartilhada

## Requisitos

Você vai precisar de:

- Node.js e npm
- Python 3.11+ recomendado
- SQLite para o backend local
- Dependências de áudio no Linux:

```bash
sudo apt update
sudo apt install -y portaudio19-dev alsa-utils ffmpeg
```

## Configuração

Copie o exemplo da raiz para `.env`:

```bash
cp .env.example .env
```

Variáveis principais:

- `DATABASE_URL`: banco usado pelo Prisma
- `GEMINI_API_KEY`: chave da API do Gemini
- `GEMINI_MODEL`: modelo usado pelo backend e pelo voice assistant
- `VITE_API_URL`: URL do backend para o frontend
- `PIPER_BINARY`: caminho do executável do Piper
- `PIPER_MODEL_PATH`: caminho do modelo `.onnx` da voz
- `AUDIO_PLAYER`: `aplay`, `paplay` ou `ffplay`
- `VOICE_ASSISTANT_WHISPER_MODEL_SIZE`: modelo do Whisper usado no STT
- `VOICE_ASSISTANT_WHISPER_DEVICE`: `cpu` ou `cuda`
- `VOICE_ASSISTANT_WHISPER_COMPUTE_TYPE`: `int8`, `float16` ou `float32`

Observações importantes:

- O frontend só lê variáveis com prefixo `VITE_`.
- O backend lê o `.env` da raiz.
- O voice assistant também lê o `.env` da raiz, então você não precisa manter arquivos separados.

## Instalação

Instale tudo de uma vez na raiz:

```bash
make install-all
```

Ou:

```bash
npm run install:all
```

Isso faz:

- `npm install`
- cria `voice-assistant/.venv`
- instala as dependências Python do assistente

## Banco de Dados

O backend usa Prisma com schema em [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma).

Gerar o client:

```bash
npm run prisma:generate
```

Aplicar o schema local:

```bash
npm run prisma:push
```

Se precisar rodar diretamente dentro de `backend/`, os scripts também funcionam lá.

## Executar Tudo

Subir frontend, backend e voice assistant ao mesmo tempo:

```bash
npm run dev:all
```

Ou:

```bash
make dev-all
```

Se preferir subir separadamente:

```bash
npm run dev:frontend
npm run dev:backend
make voice-run
```

## Voice Assistant

O assistente de voz fica em [`voice-assistant/`](./voice-assistant).

Documentação completa:

- [`voice-assistant/README.md`](./voice-assistant/README.md)

Resumo do que ele faz:

- captura áudio com `sounddevice`
- transcreve com `faster-whisper`
- envia contexto para Gemini
- sintetiza resposta com Piper via subprocess
- mantém histórico e preferências em JSON local

### Teste de voz

Para testar apenas a fala da IA:

```bash
npm run voice:tts-test
```

Ou:

```bash
make voice-tts-test
```

Você também pode passar um texto customizado:

```bash
make voice-tts-test TEXT="Olá, eu sou a Zynara."
```

### Instalação do Piper

O projeto espera:

- um binário do Piper acessível em `PIPER_BINARY`
- um modelo `.onnx` em `PIPER_MODEL_PATH`

Exemplo de configuração:

```env
  PIPER_BINARY=voice-assistant/.venv/bin/piper
PIPER_MODEL_PATH=/home/seu_usuario/voices/piper/pt_BR-cadu-medium/pt_BR-cadu-medium.onnx
AUDIO_PLAYER=aplay
```

Uma voz PT-BR recomendada para começar é `pt_BR-cadu-medium`.

## Frontend

O frontend fica em [`frontend/`](./frontend) e usa:

- React 19
- Vite
- Tailwind
- i18n em PT-BR, EN e ES

Páginas principais:

- Landing
- Login
- Register
- Chat
- Onboarding
- Pricing
- About
- PaymentMock

## Backend

O backend fica em [`backend/`](./backend) e expõe:

- auth
- chat
- payment mock
- user
- assistant status

Ele também concentra:

- Prisma
- integração com Gemini
- sessão de visitantes
- JWT e middleware de autenticação

## Comandos Úteis

Na raiz:

```bash
make install-all
make dev-all
make voice-run
make voice-once
make voice-devices
make voice-test
make voice-tts-test
```

Ou via npm:

```bash
npm run install:all
npm run dev:all
npm run voice:run
npm run voice:once
npm run voice:devices
npm run voice:test
npm run voice:tts-test
```

## Troubleshooting

### `GEMINI_API_KEY is required`

Verifique se o `.env` da raiz existe e contém `GEMINI_API_KEY`.

### Prisma não encontra `DATABASE_URL`

Garanta que você está usando o `.env` da raiz e rode:

```bash
npm run prisma:push
```

### O assistente não fala

Confira:

- `PIPER_BINARY`
- `PIPER_MODEL_PATH`
- `AUDIO_PLAYER`

Se estiver em Linux com ambiente gerenciado, instale o Piper na venv do assistente:

```bash
cd voice-assistant
.venv/bin/pip install piper-tts
```

### Microfone não aparece

Liste os dispositivos:

```bash
npm run voice:devices
```

## Notas de segurança

- A chave do Gemini fica no `.env` da raiz, mas não é exposta ao navegador.
- O frontend só recebe variáveis com prefixo `VITE_`.
- O voice assistant roda localmente e mantém o histórico em arquivos JSON no disco.

## Documentação complementar

- [`voice-assistant/README.md`](./voice-assistant/README.md)
- [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma)
- [`scripts/dev-all.mjs`](./scripts/dev-all.mjs)
