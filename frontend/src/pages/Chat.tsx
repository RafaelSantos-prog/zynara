import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/layout/AppShell";
import { SessionList } from "@/components/chat/SessionList";
import { MessageList } from "@/components/chat/MessageList";
import { Composer } from "@/components/chat/Composer";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";

export function Chat() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const {
    sessions,
    activeSessionId,
    messagesBySession,
    lastReplySource,
    isTyping,
    isLoading,
    error,
    loadSessions,
    openSession,
    createSession,
    deleteSession,
    sendMessage
  } = useChat();

  useEffect(() => {
    if (token) {
      void loadSessions();
    }
  }, [loadSessions, token]);

  useEffect(() => {
    if (activeSessionId) {
      void openSession(activeSessionId);
    }
  }, [activeSessionId, openSession]);

  const activeMessages = activeSessionId ? messagesBySession[activeSessionId] ?? [] : [];

  return (
    <AppShell>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">chat</p>
          <h1 className="hero-title mt-3 text-4xl font-semibold">Rituais de presença com memória de contexto</h1>
        </div>
        <div className="text-sm text-white/50">
          {isLoading ? t("common.loading") : `${sessions.length} sessões`}
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelect={(sessionId) => void openSession(sessionId)}
          onNewSession={() => void createSession()}
          onDeleteSession={(sessionId) => void deleteSession(sessionId)}
        />

        <section className="flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-white/60">
              {activeSessionId ? "Sessão ativa pronta para continuidade." : t("chat.emptyState")}
            </p>
            <div className="flex items-center gap-3">
              {lastReplySource ? (
                <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${lastReplySource === "gemini" ? "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20" : "bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/20"}`}>
                  {lastReplySource === "gemini" ? "Gemini" : "Fallback local"}
                </span>
              ) : null}
              {isTyping ? <TypingIndicator /> : null}
            </div>
          </div>

          <MessageList messages={activeMessages} />
          <Composer onSend={(content) => sendMessage(content)} disabled={isTyping} />
        </section>
      </div>
    </AppShell>
  );
}
