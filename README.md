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
