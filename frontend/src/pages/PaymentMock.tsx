import { useParams, Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

export function PaymentMock() {
  const { subscriptionId } = useParams();

  return (
    <AppShell>
      <div className="mx-auto grid max-w-2xl gap-6">
        <section className="glass-panel rounded-[32px] p-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">checkout mock</p>
          <h1 className="hero-title mt-3 text-4xl font-semibold">Assinatura em modo demonstração</h1>
          <p className="mt-4 text-sm leading-7 text-white/60">
            Este fluxo existe apenas para validar o contrato de pagamento com Mercado Pago sem usar credenciais reais.
          </p>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4 text-left text-sm text-white/70">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">subscription id</div>
            <div className="mt-2 font-mono text-sm text-white">{subscriptionId}</div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/chat"
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-glow"
            >
              Ir para o chat
            </Link>
            <Link
              to="/chat"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
            >
              Voltar ao chat
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
