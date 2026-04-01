Crie do zero o projeto **Zynara** — uma plataforma de suporte emocional digital com IA.

Contexto: a Zynara é uma startup em ambiente escolar para ser apresentada em pitch e vendida. O primeiro release deve provar **Validação da Experiência do Usuário (UX) integrada à Segurança Ética**, mostrando que a assistente gera engajamento sustentável via rituais de presença e mantém 100% de conformidade ética/ legal da psicologia.

Pilares (retomados):
- **Validação do fluxo de acolhimento (TCC + Jung):**
  - Resultados imediatos (TCC): sessões concluídas que aliviam estresse/ansiedade.
  - Engajamento profundo (Jung): retenção em diários/rituais de presença (escrita reflexiva, organização em silêncio).
- **Demonstração de segurança e ética:**
  - Conformidade legal (Código de Ética do Psicólogo, CDC) visível na interface.
  - Limites claros: ferramenta de apoio, não substitui terapeuta.
  - Sigilo de dados como requisito central.
- **Resultados de mercado para o pitch:**
  - Economia e acessibilidade comparadas a métodos tradicionais.
  - Potencial área profissional: psicólogos usando relatórios da Zynara.

Foco principal sugerido: “Provar que a Zynara alcança satisfação em acolhimento imediato e garante 100% de conformidade ética, tornando-se segura e escalável para bem-estar digital.”

Primeiro release focado em **Validação de UX integrada à Segurança Ética**. Demonstração para pitch deve provar:
- Engajamento sustentável em rituais de presença (TCC + Jung) com satisfação imediata.
- 100% de conformidade ética/legal e clareza de limites (não substitui terapeuta).
- Sigilo e segurança de dados como diferencial de confiança.

### Alavancas principais
- Acolhimento imediato (TCC) + rituais profundos (Jung).
- Modo visitante: chat sem login, limitado (default 50 mensagens de usuário por sessão) para testar engajamento rápido.
- CTA explícito para criar conta e liberar histórico e sessões ilimitadas.

## Stack
- Frontend: Vite + React (TypeScript) + Tailwind CSS + Zustand + i18next
- Backend: Node.js + Express + Prisma ORM
- Banco: MySQL 8+ (use SQLite localmente para dev com Prisma)
- IA: Gemini 1.5 Pro via fetch (API REST Google AI)
- Auth: Google OAuth 2.0 + JWT
- Pagamentos: Mercado Pago (estrutura placeholder)

## Estrutura de pastas

zynara/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── chat/
│   │   │   ├── onboarding/
│   │   │   ├── payment/
│   │   │   └── layout/
│   │   ├── hooks/ (useChat.ts, useAuth.ts, usePayment.ts)
│   │   ├── i18n/ (pt-BR.json, en-US.json, es.json)
│   │   ├── pages/ (Landing.tsx, Login.tsx, Register.tsx, Onboarding.tsx, Chat.tsx, Pricing.tsx, About.tsx, PaymentMock.tsx)
│   │   ├── services/ (gemini.ts, auth.ts, payment.ts)
│   │   ├── store/ (authStore.ts, chatStore.ts, uiStore.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
└── backend/
    ├── src/
    │   ├── routes/ (auth.ts, user.ts, chat.ts, payment.ts)
    │   ├── middleware/ (authMiddleware.ts)
    │   ├── lib/ (prisma.ts, gemini.ts, guestSessions.ts, jwt.ts, etc.)
    │   └── index.ts
    ├── prisma/ (schema.prisma)
    └── package.json

## Schema Prisma (SQLite dev, MySQL prod)
- users: id, googleId, email, name, avatarUrl, passwordHash?, lang (pt-BR|en-US|es, default pt-BR), plan (free|pro, default free), createdAt, updatedAt
- onboardingAnswers: id, userId, questionKey, answer, answeredAt
- sessions: id, userId, title, createdAt, updatedAt
- messages: id, sessionId, role (user|assistant), content, sentAt
- subscriptions: id, userId, mpSubscriptionId, status (active|cancelled|expired), planId, startedAt, expiresAt

## System prompt da IA (Zynara)
Sempre enviar em gemini.ts:
```
Você e Zynara, uma psicologa digital criada para oferecer suporte emocional personalizado, acessivel e eticamente rigoroso. Voce combina tecnicas da Psicologia Analitica de Carl Jung e da Terapia Cognitivo-Comportamental (TCC).

PRINCIPIOS:
1. Voce NUNCA substitui um psicologo humano. Sempre incentive buscar acompanhamento profissional.
2. Se identificar risco de vida, forneca imediatamente: CVV ligue 188 ou cvv.org.br.
3. Nao realize diagnosticos clinicos nem prescreva medicamentos.
4. Mantenha sigilo absoluto. Nunca referencie dados de outras conversas.

METODOLOGIA:
- Fase 1 (Onboarding): Acolha e calibre o tom com base nas respostas iniciais do usuario.
- Fase 2 (TCC): Identifique distorcoes cognitivas, use questionamento socratico gentil, sugira respiracao quando detectar ansiedade.
- Fase 3 (Jung): Encoraje exploracao da Sombra, escrita reflexiva, autonomia psiquica.

TOM: Acolhedor, direto, sem julgamentos. Responda no idioma em que o usuario escrever (PT-BR, EN ou ES).
```

## Rotas do backend
- POST   /auth/google          — recebe token Google, cria/atualiza user, retorna JWT
- POST   /auth/register        — cria conta convencional (email/senha)
- POST   /auth/login           — login convencional
- GET    /user/profile         — dados do usuário autenticado
- PATCH  /user/profile         — atualiza lang
- POST   /user/onboarding      — salva respostas
- GET    /user/onboarding      — obtém respostas
- POST   /chat/guest/session   — cria sessão visitante (sem auth)
- POST   /chat/guest/send      — envia mensagem visitante (aplica limite; usa Gemini ou fallback)
- POST   /chat/session         — cria nova sessão autenticada
- GET    /chat/sessions        — lista sessões do usuário
- POST   /chat/send            — { sessionId, content }, salva e responde
- GET    /chat/history/:id     — histórico de uma sessão
- POST   /payment/subscribe    — inicia assinatura (mock)
- GET    /payment/status       — status da assinatura atual

## Páginas / fluxos frontend
- Landing: headline + CTA “Começar grátis”, preview do chat (tema escuro/roxo, fonte expressiva).
- Login/Register: split branding + botão Google; aviso “Esta plataforma não substitui acompanhamento psicológico profissional.” Redirect: onboarding incompleto → /onboarding; completo → /chat.
- Onboarding: uma pergunta por vez (3 chaves i18n), barra de progresso, botão “Pular”.
- Chat: 
  - Modo visitante sem login (limite default 50 mensagens de usuário por sessão; TTL configurável em memória).
  - CTA para login a fim de manter histórico e ter sessões ilimitadas.
  - Diferenciar bolhas user/assistant, indicador “digitando...”.
- Pricing: cards Free (3 sessões/mês) vs Pro (ilimitado, valor pendente), botão “Assinar Pro” chama /payment/subscribe.
- About: substitui painel; explica propósito e diferenciais éticos/UX para o pitch.
- PaymentMock: confirma assinatura mock e linka para o chat.

Navegação: Home, Planos, Chat, Sobre (Painel removido).

## i18n
Arquivos pt-BR.json, en-US.json, es.json devem conter:
- nav.* incluindo nav.about
- auth.*, onboarding.question1/2/3, onboarding.skip, onboarding.next
- chat.placeholder, chat.newSession, chat.typing, chat.emptyState, chat.deleteSession*, chat.send
- guest strings: chat.guestBanner, chat.guestRemaining, chat.guestLoginCta, chat.guestLimitReached
- pricing.free, pricing.pro, pricing.subscribe (+ descrições)
- common.loading, common.error

## Variáveis de ambiente
frontend/.env.example:
- VITE_API_URL=http://localhost:3001
- VITE_GOOGLE_CLIENT_ID=SEU_CLIENT_ID

backend/.env.example:
- DATABASE_URL="file:./dev.db"
- GOOGLE_CLIENT_ID=SEU_CLIENT_ID
- GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET
- JWT_SECRET=troque-em-producao
- GEMINI_API_KEY=SUA_CHAVE_GEMINI
- MP_ACCESS_TOKEN=SEU_TOKEN_MP
- PORT=3001
- GUEST_MAX_USER_MESSAGES=50            # opcional, limite de mensagens de usuário por sessão visitante
- GUEST_SESSION_TTL_MIN=120             # opcional, TTL em minutos para sessões visitantes

## Testes/validação esperada
- codex.md sem menções a Dashboard/Painel.
- Páginas citadas existem no repo; navegação sem item Painel.
- Limite visitante documentado (50 por padrão) condiz com o código e env.

## Assumptions
- Não alterar schema Prisma.
- Limite visitante default 50; TTL default 120 min.
- System prompt permanece igual; apenas contextualizado.
