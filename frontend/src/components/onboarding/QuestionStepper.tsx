import { useTranslation } from "react-i18next";

type Props = {
  step: number;
  total: number;
  questionKey: "question1" | "question2" | "question3";
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  isLastStep: boolean;
};

export function QuestionStepper({ step, total, questionKey, value, onChange, onNext, onSkip, isLastStep }: Props) {
  const { t } = useTranslation();

  return (
    <section className="glass-panel mx-auto w-full max-w-2xl rounded-[32px] p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/50">
            Etapa {step + 1} de {total}
          </p>
          <h2 className="mt-2 hero-title text-3xl font-semibold">{t(`onboarding.${questionKey}`)}</h2>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          {t("onboarding.skip")}
        </button>
      </div>

      <div className="mb-6 h-2 rounded-full bg-white/5">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-500 transition-all"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        className="w-full resize-none rounded-[26px] border border-white/10 bg-[#0f1020]/80 px-5 py-4 text-base text-white outline-none transition placeholder:text-white/30 focus:border-violet-400/30"
        placeholder={t(`onboarding.${questionKey}`)}
      />

      <div className="mt-6 flex items-center justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.01]"
        >
          {isLastStep ? t("onboarding.next") : t("onboarding.next")}
        </button>
      </div>
    </section>
  );
}

