import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePayment } from "@/hooks/usePayment";

const FREE_LIMIT = 3;
const PRO_PRICE = "VALOR_PENDENTE";

export function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { subscribe, isLoading, error } = usePayment();

  const handleSubscribe = async () => {
    const result = await subscribe();
    if (result?.checkoutUrl) {
      navigate(result.checkoutUrl);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">pricing</p>
        <h1 className="hero-title mt-3 text-4xl font-semibold">Planos pensados para validar valor e confiança</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">
          O objetivo aqui é provar acessibilidade, engajamento e segurança ética antes de escalar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article className="glass-panel rounded-[32px] p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-white/50">{t("pricing.free")}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">{FREE_LIMIT} sessões/mês</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">{t("pricing.freeDescription")}</p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li>Onboarding guiado</li>
            <li>Histórico básico de conversas</li>
            <li>Avisos éticos em toda a jornada</li>
          </ul>
        </article>

        <article className="glass-panel rounded-[32px] p-6 ring-1 ring-violet-400/20">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-200">{t("pricing.pro")}</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">R$ {PRO_PRICE}/mês</h2>
          <p className="mt-3 text-sm leading-7 text-white/60">{t("pricing.proDescription")}</p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li>Sessões ilimitadas</li>
            <li>Área profissional para psicólogos</li>
            <li>Relatórios estruturados</li>
          </ul>
          <button
            type="button"
            onClick={() => void handleSubscribe()}
            disabled={isLoading}
            className="mt-8 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? t("common.loading") : t("pricing.subscribe")}
          </button>
          {error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}
        </article>
      </div>
    </div>
  );
}
