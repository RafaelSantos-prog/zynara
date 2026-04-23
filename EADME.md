<<<<<<< HEAD
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
=======
# T@NOTADO — Psicóloga Virtual com IA

## 📋 Informações do Projeto

**Nome da Startup/Projeto:** T@NOTADO

**Integrantes da Equipe:**
- Iara de Oliveira Carvalho
- Isaque Samuel Freitas da Silva
- Alessandro Gouveia dos Santos
- Emerson Alves da Silva
- Rafael Deodoro dos Santos Filho

Uma aplicação web sofisticada que combina inteligência artificial com práticas psicológicas consagradas para oferecer suporte emocional interativo e responsivo aos usuários. A plataforma utiliza modelos de linguagem avançados para simular uma conversa terapêutica, adaptando o conteúdo conforme o estado emocional e o histórico do usuário.

Desenvolvida com foco em acessibilidade e usabilidade, T@NOTADO possibilita uma experiência intuitiva, permitindo que pessoas em qualquer lugar e horário possam refletir sobre seus sentimentos, identificar padrões de pensamento disfuncionais e receber sugestões de técnicas comportamentais. Apesar de ser uma ferramenta poderosa para autocuidado, ela não substitui um acompanhamento profissional presencial e sempre encoraja a busca por ajuda humana quando necessário.
---

Uma aplicação web de saúde mental construída com **React 18**, **Vite** e **Google Gemini API**, seguindo princípios de Clean Architecture, SOLID e boas práticas de engenharia de software front-end.

## 🎯 Sobre o Projeto

Sofia é uma psicóloga virtual empática e tecnicamente fundamentada, baseada em:
- **Terapia Cognitivo-Comportamental (TCC)**
- **Terapia de Aceitação e Compromisso (ACT)**
- **Abordagem Humanista-Existencial**

A aplicação oferece um espaço seguro e confidencial para explorar pensamentos e emoções, com detecção automática de indicadores de crise e recursos de suporte imediato.

## 🚀 Stack Tecnológica

| Ferramenta | Versão | Propósito |
|-----------|--------|----------|
| React | 18+ | UI e gerenciamento de estado |
| Vite | 5+ | Build tool otimizado |
| JavaScript (ES6+) | - | Linguagem principal |
| CSS Modules | - | Estilização com escopo local |
| React Context API | - | Estado global (auth, chat, toast) |
| Fetch API | - | Integração REST com Gemini |
| localStorage | - | Persistência de sessão |

## 📁 Estrutura do Projeto

```
sofia-ai/
├── src/
│   ├── api/
│   │   └── geminiService.js        # Camada de serviço — API Gemini
│   │
│   ├── components/
│   │   ├── ui/                     # Componentes genéricos reutilizáveis
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Avatar/
│   │   │   └── Toast/
│   │   │
│   │   ├── chat/                   # Componentes específicos do domínio Chat
│   │   │   ├── ChatHeader/
│   │   │   ├── MessageList/
│   │   │   ├── MessageBubble/
│   │   │   ├── TypingIndicator/
│   │   │   ├── ChatInput/
│   │   │   └── CrisisBanner/
│   │   │
│   │   └── screens/                # Telas completas
│   │       ├── SetupScreen/        # Setup com API Key
│   │       └── ChatScreen/         # Tela principal de chat
│   │
│   ├── context/
│   │   ├── AuthContext.jsx         # Gerencia API Key e autenticação
│   │   ├── ChatContext.jsx         # Gerencia mensagens e histórico
│   │   └── ToastContext.jsx        # Notificações globais
│   │
│   ├── hooks/
│   │   ├── useChat.js              # Orquestra chat (send, receive)
│   │   ├── useGemini.js            # Abstração da API Gemini
│   │   ├── useLocalStorage.js      # Persistência em localStorage
│   │   ├── useAutoScroll.js        # Auto-scroll para última mensagem
│   │   ├── useAutoResize.js        # Textarea auto-expansível
│   │   └── useCrisisDetection.js   # Detecção de crise
│   │
│   ├── constants/
│   │   ├── systemPrompt.js         # System prompt da Sofia
│   │   ├── crisisKeywords.js       # Palavras-chave de crise
│   │   └── geminiConfig.js         # Configurações Gemini
│   │
│   ├── utils/
│   │   ├── formatTime.js           # Formatação de horários
│   │   ├── sanitizeHtml.js         # Proteção contra XSS
│   │   └── messageFactory.js       # Factory para mensagens
│   │
│   ├── styles/
│   │   ├── tokens.css              # Design tokens
│   │   ├── reset.css               # CSS reset
│   │   └── animations.css          # Keyframes globais
│   │
│   ├── App.jsx                     # Componente raiz com rotas
│   └── main.jsx                    # Ponto de entrada
```

## 🛠️ Instalação e Setup

### Pré-requisitos
- Node.js 18+ e npm
- Chave API do [Google Gemini](https://aistudio.google.com/app/apikey)

### Instalação

```bash
# Instale dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Acesse http://localhost:5173
```

### Build para Produção

```bash
npm run build        # Gera build otimizado em dist/
npm run preview      # Visualiza build localmente
```

## 🔐 Segurança e Privacidade

- **Chave API local**: Armazenada unicamente no localStorage do navegador
- **Comunicação segura**: HTTPS obrigatório em produção
- **Zero dados em servidores**: Nenhum dado além da API Google
- **Sem rastreamento**: Sem cookies ou analytics
- **Sanitização automática**: Proteção contra XSS

## 🎨 Design System

### Cores
```css
--color-bg:           #0a0a0f;      /* Fundo escuro */
--color-purple:       #7c3aed;      /* Cor principal */
--color-danger:       #ef4444;      /* Alertas e crises */
--color-online:       #34d399;      /* Status online */
--color-text:         #e8e6f0;      /* Texto primário */
```

### Tipografia
- **Display**: Playfair Display (serif)
- **Body**: Nunito (sans-serif)

## 🔄 Fluxo de Funcionamento

### 1. Autenticação
Usuário insere API Key → Armazenada em localStorage → Acesso ao chat

### 2. Chat
Mensagem digitada → useChat → Gemini API → Sofia responde → Auto-scroll

### 3. Detecção de Crise
Texto analisado → Crisis keywords → Banner com recursos → Divulgação de ajuda

## 🎮 UX — Comportamentos

- **Enter**: Envia mensagem
- **Shift+Enter**: Nova linha
- **Textarea**: Auto-expande até 120px
- **Auto-scroll**: Suave para última mensagem
- **Animações**: Spring + cubic-bezier para naturalidade

## 🌐 API Integration

**Google Gemini 1.5 Flash**
- Temperature: 0.85 (criatividade balanceada)
- Max tokens: 800 (respostas completas mas concisas)
- Safety: Desabilitado (sensibilidade clínica)

## 📱 Responsividade

✅ Desktop (1440px+) | Tablet (768px-1440px) | Mobile (320px-768px)

## ♿ Acessibilidade (WCAG AA)

- ARIA labels em botões
- Contraste 4.5:1
- Keyboard navigation
- Screen reader ready
- ✅ Testing em múltiplos dispositivos

## 🚀 Deploy

**Vercel** (recomendado):
```bash
npm install -g vercel && vercel
```

**Build Docker**:
```bash
npm run build && docker build -t sofia-ai .
```

## 📋 Checklist Pré-Produção

- [ ] HTTPS ativo
- [ ] API Key de produção (não teste)
- [ ] Privacy policy publicada
- [ ] Testar em múltiplos dispositivos
- [ ] Monitoring de erros (Sentry)
- [ ] Backup strategy

## 🐛 Troubleshooting

**API Key inválida?** → Obtenha em https://aistudio.google.com/app/apikey

**Mensagens não carregam?** → Abra DevTools (F12) → Network → verifique XHR

**CSS quebrado?** → `Ctrl+Shift+R` para limpar cache

## 📚 Recursos

- [Google Gemini API](https://ai.google.dev/)
- [React 18](https://react.dev)
- [Vite](https://vitejs.dev)
- [CVV Brasil — 188](https://www.cvv.org.br/)

## 📄 Licença

Fornecido para fins educacionais e terapêuticos.
**Sofia não substitui acompanhamento profissional.**

---

**Desenvolvido para saúde mental digital.** 🧠❤️

*CVV: 188 | SAMU: 192 | Sofia: Um ouvido virtual sempre disponível.*
>>>>>>> 1b3a218255a6777798e1e4aa394efc7b50137649
