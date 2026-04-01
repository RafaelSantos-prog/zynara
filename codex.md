Crie do zero o projeto Zynara — uma plataforma de suporte emocional digital com IA.

Considerando que o projeto Zynara é uma startup desenvolvida em ambiente escolar com o objetivo de ser apresentada em um pitch e vendida, o foco principal deste primeiro release deve ser a Validação da Experiência do Usuário (UX) integrada à Segurança Ética.
Para um investidor ou avaliador de pitch, o resultado concreto mais impactante para provar nesta fase seria demonstrar que a assistente virtual é capaz de gerar engajamento sustentável através de rituais de presença, mantendo-se 100% dentro das normas éticas e legais da psicologia
.
Abaixo, detalho os pilares desse resultado concreto baseados nas fontes:
1. Validação do Fluxo de Acolhimento (TCC e Jung)
O sucesso do produto depende de provar que a metodologia integrativa funciona na prática:
Resultados Imediatos (TCC): Provar, através de métricas de sessões concluídas, que a técnica de Terapia Cognitivo-Comportamental oferece alívio rápido para sintomas de estresse e ansiedade, validando a Zynara como uma ferramenta de ação
.
Engajamento Profundo (Jung): Demonstrar a adesão dos usuários aos "rituais de presença" e à escrita reflexiva (como o hábito de organizar a vida em silêncio)
. O resultado concreto seria a taxa de retenção em diários de autoconhecimento, provando que a assistente virtual ajuda no processo de individuação
.
2. Demonstração de Segurança e Ética (O diferencial do produto)
Para um produto ser vendável no setor de saúde mental, a confiança é o maior ativo:
Conformidade Legal: O release deve comprovar a inclusão obrigatória do Código de Ética do Psicólogo e do Código de Defesa do Consumidor na interface
.
Limites de Atuação: Provar que a interface comunica claramente que é uma ferramenta de apoio e não substitui o terapeuta humano, evitando riscos legais e éticos
.
Sigilo de Dados: Demonstrar a implementação de protocolos de segurança avançados que garantam a confidencialidade absoluta das conversas, um requisito essencial para qualquer solução de assistência emocional
.
3. Resultados de Mercado para o Pitch
Para tornar o projeto atrativo em um formato de startup:
Economia e Acessibilidade: Apresentar dados (mesmo que baseados em testes iniciais) sobre a economia de tempo e dinheiro para o usuário final em comparação com métodos tradicionais, conforme observado em projetos semelhantes
.
Escalabilidade Profissional: Demonstrar o potencial de uma "área profissional" onde psicólogos humanos possam usar os relatórios gerados pela Zynara para otimizar seus próprios atendimentos
.
Foco Principal Sugerido: "Provar que a Zynara alcança uma taxa de satisfação X% em acolhimento emocional imediato e garante 100% de conformidade ética, tornando-a um produto seguro e escalável para o mercado de bem-estar digital."
.
Gostaria que eu ajudasse a estruturar os tópicos principais para o seu roteiro de pitch, focando em como vender esses diferenciais éticos e técnicos da Zynara?
## Stack
- Frontend: Vite + React (TypeScript) + Tailwind CSS + Zustand + i18next
- Backend: Node.js + Express + Prisma ORM
- Banco: MySQL 8+ (use SQLite localmente para dev com Prisma)
- IA: Gemini 1.5 Pro via fetch para a API REST do Google AI
- Auth: Google OAuth 2.0 + JWT
- Pagamentos: Mercado Pago (apenas estrutura, sem credenciais reais)

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
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useAuth.ts
│   │   │   └── usePayment.ts
│   │   ├── i18n/
│   │   │   ├── pt-BR.json
│   │   │   ├── en-US.json
│   │   │   └── es.json
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Onboarding.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── services/
│   │   │   ├── gemini.ts
│   │   │   ├── auth.ts
│   │   │   └── payment.ts
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── chatStore.ts
│   │   │   └── uiStore.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
└── backend/
    ├── src/
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   ├── chat.ts
    │   │   ├── payment.ts
    │   │   └── user.ts
    │   ├── middleware/
    │   │   └── authMiddleware.ts
    │   ├── lib/
    │   │   └── prisma.ts
    │   └── index.ts
    ├── prisma/
    │   └── schema.prisma
    └── package.json

## Schema Prisma (SQLite para dev, MySQL para prod)

Tabelas:
- users: id, googleId, email, name, avatarUrl, lang (pt-BR|en-US|es, default pt-BR), plan (free|pro, default free), createdAt
- onboardingAnswers: id, userId, questionKey, answer, answeredAt
- sessions: id, userId, title, createdAt
- messages: id, sessionId, role (user|assistant), content, sentAt
- subscriptions: id, userId, mpSubscriptionId, status (active|cancelled|expired), planId, startedAt, expiresAt

## System prompt da IA (Zynara)

O arquivo gemini.ts deve enviar este system prompt em toda chamada:

"Você e Zynara, uma psicologa digital criada para oferecer suporte emocional personalizado, acessivel e eticamente rigoroso. Voce combina tecnicas da Psicologia Analitica de Carl Jung e da Terapia Cognitivo-Comportamental (TCC).

PRINCIPIOS:
1. Voce NUNCA substitui um psicologo humano. Sempre incentive buscar acompanhamento profissional.
2. Se identificar risco de vida, forneca imediatamente: CVV ligue 188 ou cvv.org.br.
3. Nao realize diagnosticos clinicos nem prescreva medicamentos.
4. Mantenha sigilo absoluto. Nunca referencie dados de outras conversas.

METODOLOGIA:
- Fase 1 (Onboarding): Acolha e calibre o tom com base nas respostas iniciais do usuario.
- Fase 2 (TCC): Identifique distorcoes cognitivas, use questionamento socratico gentil, sugira respiracao quando detectar ansiedade.
- Fase 3 (Jung): Encoraje exploracao da Sombra, escrita reflexiva, autonomia psiquica.

TOM: Acolhedor, direto, sem julgamentos. Responda no idioma em que o usuario escrever (PT-BR, EN ou ES)."

## Rotas do backend

POST   /auth/google          — recebe token Google, cria/atualiza user, retorna JWT
GET    /user/profile         — retorna dados do usuario autenticado
PATCH  /user/profile         — atualiza lang
POST   /chat/session         — cria nova sessao
GET    /chat/sessions        — lista sessoes do usuario
POST   /chat/send            — recebe { sessionId, content }, salva mensagem user, chama Gemini, salva resposta, retorna { reply }
GET    /chat/history/:id     — retorna mensagens de uma sessao
POST   /payment/subscribe    — inicia assinatura Mercado Pago (placeholder)
GET    /payment/status       — retorna status da assinatura atual

## Paginas do frontend

Landing.tsx
- Split-screen: esquerda = headline emocional + CTA "Comecar Gratis", direita = preview do chat animado
- Design escuro/roxo, fonte expressiva, sem layout generico

Login.tsx
- Split-screen: esquerda = branding Zynara, direita = botao "Entrar com Google"
- Aviso obrigatorio: "Esta plataforma nao substitui acompanhamento psicologico profissional."

Onboarding.tsx
- Uma pergunta por vez (3 perguntas placeholder com chaves i18n)
- Barra de progresso, botao "Pular"
- Perguntas: "Como voce esta se sentindo ultimamente?", "O que te trouxe ate aqui?", "Ha algo especifico que gostaria de trabalhar?"

Chat.tsx
- Sidebar com lista de sessoes + botao "Nova sessao"
- Area de mensagens com bolhas diferenciadas (usuario direita, Zynara esquerda com avatar)
- Input com envio por Enter ou botao, indicador de "digitando..."

Pricing.tsx
- Dois cards: Gratuito (3 sessoes/mes) vs Pro (ilimitado, R$ VALOR_PENDENTE/mes)
- Botao "Assinar Pro" chama POST /payment/subscribe

Dashboard.tsx
- Lista de sessoes anteriores com data e titulo
- Plano atual do usuario

## i18n

Os 3 arquivos JSON devem conter as chaves:
- nav.*, auth.*, onboarding.question1/2/3, onboarding.skip, onboarding.next, chat.placeholder, chat.newSession, pricing.free, pricing.pro, pricing.subscribe, common.loading, common.error

## Variaveis de ambiente

frontend/.env.example:
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=SEU_CLIENT_ID

backend/.env.example:
DATABASE_URL="file:./dev.db"
GOOGLE_CLIENT_ID=SEU_CLIENT_ID
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET
JWT_SECRET=troque-em-producao
GEMINI_API_KEY=SUA_CHAVE_GEMINI
MP_ACCESS_TOKEN=SEU_TOKEN_MP
PORT=3001