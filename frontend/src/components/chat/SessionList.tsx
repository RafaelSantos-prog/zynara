import { useTranslation } from "react-i18next";
import type { ChatSession } from "@/services/chat";

type Props = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
};

export function SessionList({ sessions, activeSessionId, onSelect, onNewSession, onDeleteSession }: Props) {
  const { t } = useTranslation();

  return (
    <aside className="glass-panel flex h-full min-h-[520px] flex-col rounded-[28px] p-4">
      <button
        type="button"
        onClick={onNewSession}
        className="mb-4 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-left text-sm font-semibold text-white shadow-glow transition hover:scale-[1.01]"
      >
        {t("chat.newSession")}
      </button>

      <div className="space-y-2 overflow-y-auto pr-1 scrollbar">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            {t("chat.emptyState")}
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`rounded-2xl border px-4 py-3 transition ${
                  isActive
                    ? "border-violet-400/30 bg-violet-500/15 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold">{session.title}</span>
                      <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">sessão</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-white/50">
                      {session.messages?.[0]?.content ?? "Comece compartilhando um pouco do que está sentindo."}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const confirmed = window.confirm(
                        t("chat.deleteSessionConfirm")
                      );
                      if (confirmed) {
                        onDeleteSession(session.id);
                      }
                    }}
                    aria-label={t("chat.deleteSessionAria", { title: session.title })}
                    title={t("chat.deleteSession")}
                    className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition hover:border-rose-400/30 hover:bg-rose-500/15 hover:text-rose-100"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
