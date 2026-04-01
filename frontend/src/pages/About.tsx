export function About() {
  return (
    <div className="mx-auto grid max-w-4xl gap-8">
      <section className="glass-panel rounded-[32px] p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">sobre</p>
        <h1 className="hero-title mt-3 text-4xl font-semibold">Por que a Zynara existe?</h1>
        <p className="mt-4 text-lg leading-8 text-white/70">
          Zynara é uma assistente emocional digital focada em acolhimento ético, combinando TCC e Jung para rituais
          de presença. Este espaço substitui o painel e serve para explicar o propósito do projeto durante a fase de
          validação e pitch.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">foco</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Acolhimento imediato</h3>
            <p className="mt-2 text-sm text-white/65">Resposta rápida com segurança ética e orientação clara.</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">ética</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Limites bem definidos</h3>
            <p className="mt-2 text-sm text-white/65">Não substitui terapeuta, sigilo e limites de atuação explícitos.</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">pitch</p>
            <h3 className="mt-2 text-lg font-semibold text-white">Valor para o investidor</h3>
            <p className="mt-2 text-sm text-white/65">Engajamento em rituais + conformidade ética como diferencial.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
