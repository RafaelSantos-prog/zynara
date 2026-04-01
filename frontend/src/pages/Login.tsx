import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = await signInWithEmail(email.trim(), password);
    if (session) {
      navigate(session.onboardingComplete ? "/chat" : "/onboarding");
    }
  };

  const handleGoogleLogin = async () => {
    const session = await signInWithGoogle();
    if (session) {
      navigate(session.onboardingComplete ? "/chat" : "/onboarding");
    }
  };

  return (
    <div className="min-h-screen bg-[#181818] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <section className="space-y-5">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Zynara</h1>
            <p className="mt-3 text-sm text-white/60">{t("auth.loginHint")}</p>
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
            <div className="space-y-2">
              <label className="sr-only" htmlFor="login-email">
                {t("auth.email")}
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("auth.email")}
                className="w-full rounded-[14px] border border-white/15 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/35"
              />
            </div>

            <div className="space-y-2">
              <label className="sr-only" htmlFor="login-password">
                {t("auth.password")}
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("auth.password")}
                className="w-full rounded-[14px] border border-white/15 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/35"
              />
            </div>

            {error ? (
              <div className="rounded-[14px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-full bg-[#1877f2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t("auth.loading") : t("auth.signIn")}
            </button>
          </form>

          <div className="relative py-2 text-center">
            <span className="inline-flex rounded-full bg-[#181818] px-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              {t("auth.orContinue")}
            </span>
            <div className="absolute left-0 right-0 top-1/2 -z-10 h-px bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-[#262626] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#10101f]">
              G
            </span>
            {isLoading ? t("auth.loading") : t("auth.googleButton")}
          </button>

          <div className="pt-3 text-center">
            <Link to="/register" className="text-sm font-semibold text-[#3ea6ff] hover:underline">
              {t("auth.switchToRegister")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
