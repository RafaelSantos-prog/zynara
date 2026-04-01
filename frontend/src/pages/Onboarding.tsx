import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { saveOnboardingAnswers } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";
import { QuestionStepper } from "@/components/onboarding/QuestionStepper";

const questionKeys = ["question1", "question2", "question3"] as const;

export function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<(typeof questionKeys)[number], string>>({
    question1: "",
    question2: "",
    question3: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [navigate, token]);

  const currentKey = questionKeys[step];
  const isLastStep = step === questionKeys.length - 1;

  const progressLabel = useMemo(() => `${step + 1} / ${questionKeys.length}`, [step]);

  const handleNext = async () => {
    if (!currentKey) {
      return;
    }

    if (isLastStep) {
      setIsSaving(true);
      setError(null);
      try {
        await saveOnboardingAnswers(
          questionKeys.map((questionKey) => ({
            questionKey,
            answer: answers[questionKey]
          }))
        );
        navigate("/chat");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save onboarding");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setStep((value) => value + 1);
  };

  const handleSkip = async () => {
    navigate("/chat");
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">onboarding</p>
        <h1 className="hero-title mt-4 text-4xl font-semibold">Vamos calibrar a presença da Zynara para você</h1>
        <p className="mt-3 text-sm leading-7 text-white/60">
          {user?.name ? `Olá, ${user.name}.` : "Olá."} Esse fluxo ajuda a ajustar o tom, a escuta e a primeira resposta.
        </p>
        <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">progresso {progressLabel}</p>
      </div>

      <QuestionStepper
        step={step}
        total={questionKeys.length}
        questionKey={currentKey}
        value={answers[currentKey]}
        onChange={(value) => setAnswers((state) => ({ ...state, [currentKey]: value }))}
        onNext={() => void handleNext()}
        onSkip={() => void handleSkip()}
        isLastStep={isLastStep}
      />

      {error ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {isSaving ? <div className="text-center text-sm text-white/50">{t("common.loading")}</div> : null}
    </div>
  );
}

