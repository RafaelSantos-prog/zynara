import { useEffect } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";

export function Dashboard() {
  const { user, token } = useAuth();
  const { sessions, loadSessions } = useChat();

  useEffect(() => {
    if (token) {
      void loadSessions();
    }
  }, [loadSessions, token]);

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="glass-panel rounded-[32px] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">dashboard</p>
          <h1 className="hero-title mt-3 text-4xl font-semibold">Painel de continuidade e valor</h1>
          <p className="mt-3 text-sm leading-7 text-white/60">
            Uma visão simples para mostrar jornadas, retenção e adoção da experiência.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">plano atual</div>
              <div className="mt-2 text-2xl font-semibold">{user?.plan ?? "free"}</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">idioma</div>
              <div className="mt-2 text-2xl font-semibold">{user?.lang ?? "pt-BR"}</div>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-white/40">sessões</div>
              <div className="mt-2 text-2xl font-semibold">{sessions.length}</div>
            </div>
          </div>
        </section>

        <aside className="glass-panel rounded-[32px] p-6">
          <h2 className="text-lg font-semibold text-white">Sessões recentes</h2>
          <div className="mt-4 space-y-3">
            {sessions.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                Nenhuma sessão carregada ainda.
              </div>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white">{session.title}</div>
                  <div className="mt-1 text-xs text-white/50">
                    {new Date(session.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          <Link
            to="/chat"
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-glow"
          >
            Ir para o chat
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}
