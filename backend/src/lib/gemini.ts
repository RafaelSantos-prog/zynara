const SYSTEM_PROMPT = `Você e Zynara, uma psicologa digital criada para oferecer suporte emocional personalizado, acessivel e eticamente rigoroso. Voce combina tecnicas da Psicologia Analitica de Carl Jung e da Terapia Cognitivo-Comportamental (TCC).

PRINCIPIOS:
1. Voce NUNCA substitui um psicologo humano. Sempre incentive buscar acompanhamento profissional.
2. Se identificar risco de vida, forneca imediatamente: CVV ligue 188 ou cvv.org.br.
3. Nao realize diagnosticos clinicos nem prescreva medicamentos.
4. Mantenha sigilo absoluto. Nunca referencie dados de outras conversas.

METODOLOGIA:
- Fase 1 (Onboarding): Acolha e calibre o tom com base nas respostas iniciais do usuario.
- Fase 2 (TCC): Identifique distorcoes cognitivas, use questionamento socratico gentil, sugira respiracao quando detectar ansiedade.
- Fase 3 (Jung): Encoraje exploracao da Sombra, escrita reflexiva, autonomia psiquica.

TOM: Acolhedor, direto, sem julgamentos. Responda no idioma em que o usuario escrever (PT-BR, EN ou ES).`;

const CRISIS_PATTERNS = [
  /suicid/i,
  /quero morrer/i,
  /quero me matar/i,
  /me matar/i,
  /autoagress/i,
  /automutil/i,
  /kill myself/i,
  /end my life/i
];

export type GeminiContext = {
  userMessage: string;
  onboardingSummary?: string;
  recentHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  language?: string;
};

export type GeminiReplyResult = {
  reply: string;
  source: "gemini" | "fallback";
  error?: string;
};

function detectCrisis(message: string) {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(message));
}

function buildPrompt(context: GeminiContext) {
  const history = (context.recentHistory ?? [])
    .slice(-8)
    .map((entry) => `${entry.role.toUpperCase()}: ${entry.content}`)
    .join("\n");

  const onboarding = context.onboardingSummary ? `ONBOARDING: ${context.onboardingSummary}` : "ONBOARDING: sem dados adicionais.";

  return [
    SYSTEM_PROMPT,
    onboarding,
    history ? `HISTORICO RECENTE:\n${history}` : "HISTORICO RECENTE: vazio.",
    `MENSAGEM ATUAL: ${context.userMessage}`
  ].join("\n\n");
}

function localSupportiveReply(context: GeminiContext) {
  const language = context.language ?? "pt-BR";
  const crisis = detectCrisis(context.userMessage);

  if (crisis) {
    if (language === "en-US") {
      return "I am worried about your safety. If you might act on these thoughts now, call emergency services immediately. In Brazil, call CVV 188 or visit cvv.org.br right now. If you can, move closer to someone you trust and tell them you need support.";
    }
    if (language === "es") {
      return "Me preocupa tu seguridad. Si sientes que podrías actuar sobre estos pensamientos ahora, busca ayuda de emergencia de inmediato. En Brasil, llama al CVV 188 o visita cvv.org.br ahora mismo. Si puedes, acércate a alguien de confianza y dile que necesitas apoyo.";
    }
    return "Estou preocupado com a sua segurança. Se existir qualquer chance de você agir sobre esses pensamentos agora, procure ajuda imediata. No Brasil, ligue 188 (CVV) ou acesse cvv.org.br neste momento. Se puder, fique perto de alguém de confiança e diga que precisa de apoio.";
  }

  if (language === "en-US") {
    return "I hear you. Let’s slow this down together: what happened right before you started feeling this way, and what would feel like one small safe next step right now?";
  }
  if (language === "es") {
    return "Te leo. Vamos bajar un poco el ritmo: ¿qué pasó justo antes de que te sintieras así, y cuál sería un siguiente paso pequeño y seguro ahora mismo?";
  }

  return "Eu te ouvi. Vamos desacelerar juntos: o que aconteceu pouco antes de você começar a se sentir assim, e qual seria um pequeno próximo passo seguro agora?";
}

export async function generateGeminiReply(context: GeminiContext): Promise<GeminiReplyResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const prompt = buildPrompt(context);

  if (!apiKey) {
    return {
      reply: localSupportiveReply(context),
      source: "fallback",
      error: "GEMINI_API_KEY is missing"
    };
  }

  try {
    console.log("[gemini] sending request");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 512
          }
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("[gemini] request failed", {
        model,
        status: response.status,
        statusText: response.statusText,
        body: errorBody
      });
      return {
        reply: localSupportiveReply(context),
        source: "fallback",
        error: `Gemini API returned ${response.status} ${response.statusText}`
      };
    }

    const data = await response.json() as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };

    const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (reply && reply.length > 0) {
      console.log("[gemini] request succeeded", { model });
      return {
        reply,
        source: "gemini"
      };
    }

    console.warn("[gemini] empty reply payload", { model, data });
    return {
      reply: localSupportiveReply(context),
      source: "fallback",
      error: "Gemini API returned an empty reply"
    };
  } catch (error) {
    console.error("[gemini] unexpected error", error);
    return {
      reply: localSupportiveReply(context),
      source: "fallback",
      error: error instanceof Error ? error.message : "Unexpected Gemini error"
    };
  }
}

export function getSystemPrompt() {
  return SYSTEM_PROMPT;
}
