import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function Landing() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <section className="fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-white/60">
          suporte emocional digital
        </div>
        <h1 className="hero-title mt-6 max-w-3xl text-5xl font-semibold leading-none text-white sm:text-6xl xl:text-7xl">
          Presença emocional que parece humana, mas nasce com limites éticos.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
          Zynara acolhe, organiza e devolve clareza com rituais de presença, journaling e suporte orientado por segurança.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/login" className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-glow">
            Começar grátis
          </Link>
          <Link to="/pricing" className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10">
            Ver planos
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["92%", "engajamento em rituais"],
            ["100%", "avisos éticos visíveis"],
            ["24/7", "presença contínua"]
          ].map(([value, label]) => (
            <div key={label} className="glass-panel rounded-[24px] p-4">
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="mt-1 text-sm text-white/60">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative">
        <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -right-8 bottom-8 h-36 w-36 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="glass-panel float-slow relative overflow-hidden rounded-[36px] p-5">
          <div className="mb-4 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/5 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">preview do chat</p>
              <p className="mt-1 text-sm font-semibold text-white">ritual de presença</p>
            </div>
            <div className="pulse-ring h-3 w-3 rounded-full bg-violet-400" />
          </div>

          <div className="space-y-3">
            {[
              { side: "right", text: "Ando muito acelerado e sem energia para organizar meus dias." },
              { side: "left", text: "Vamos diminuir o ritmo juntos. O que mais pesa hoje: corpo, mente ou rotina?" },
              { side: "right", text: "A rotina e a sensação de estar falhando." },
              { side: "left", text: "Vamos trabalhar isso sem culpa. Me diga um pequeno gesto possível para hoje." }
            ].map((message, index) => (
              <div key={index} className={`flex ${message.side === "right" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[84%] rounded-[22px] px-4 py-3 text-sm leading-6 ${
                    message.side === "right"
                      ? "bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white"
                      : "bg-white/10 text-white/78 ring-1 ring-white/10"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-[24px] border border-white/10 bg-[#0f1020]/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">segurança ética</p>
            <p className="mt-2 text-sm text-white/70">
              Zynara lembra que não substitui psicólogo humano, respeita sigilo e aciona orientação de crise quando necessário.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

