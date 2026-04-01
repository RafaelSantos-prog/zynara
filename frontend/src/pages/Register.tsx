import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

const days = Array.from({ length: 31 }, (_, index) => String(index + 1).padStart(2, "0"));
const months = [
  "01", "02", "03", "04", "05", "06",
  "07", "08", "09", "10", "11", "12"
];
const years = Array.from({ length: 70 }, (_, index) => String(new Date().getFullYear() - index));

export function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { registerWithEmail, signInWithGoogle, isLoading, error } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const session = await registerWithEmail(fullName.trim(), email.trim(), password);
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
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col justify-center px-6 py-10">
        <section className="space-y-5">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight">{t("auth.signupTitle")}</h1>
            <p className="mt-2 text-sm text-white/60">{t("auth.registerHint")}</p>
          </div>

          <div className="rounded-[10px] border border-white/10 bg-[#1f1f1f] px-4 py-3 text-xs leading-5 text-white/55">
            {t("auth.disclaimer")}
          </div>

          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3 text-left">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/75">{t("auth.email")}</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder={t("auth.email")}
                className="w-full rounded-[8px] border border-white/15 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/35"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/75">{t("auth.password")}</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder={t("auth.password")}
                className="w-full rounded-[8px] border border-white/15 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/35"
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white/75">{t("auth.day")}</span>
                <select
                  value={day}
                  onChange={(event) => setDay(event.target.value)}
                  className="w-full rounded-[8px] border border-white/15 bg-[#262626] px-3 py-3 text-sm text-white outline-none transition focus:border-white/35"
                >
                  <option value="">{t("auth.day")}</option>
                  {days.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-white/75">{t("auth.month")}</span>
                <select
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="w-full rounded-[8px] border border-white/15 bg-[#262626] px-3 py-3 text-sm text-white outline-none transition focus:border-white/35"
                >
                  <option value="">{t("auth.month")}</option>
                  {months.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-white/75">{t("auth.year")}</span>
                <select
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  className="w-full rounded-[8px] border border-white/15 bg-[#262626] px-3 py-3 text-sm text-white outline-none transition focus:border-white/35"
                >
                  <option value="">{t("auth.year")}</option>
                  {years.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/75">{t("auth.fullName")}</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                type="text"
                placeholder={t("auth.fullName")}
                className="w-full rounded-[8px] border border-white/15 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/35"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-white/75">{t("auth.username")}</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                type="text"
                placeholder={t("auth.username")}
                className="w-full rounded-[8px] border border-white/15 bg-[#262626] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-white/35"
              />
            </label>

            {error ? (
              <div className="rounded-[8px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-[8px] bg-[#1877f2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? t("auth.loading") : t("auth.createAccount")}
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
            className="flex w-full items-center justify-center gap-3 rounded-[8px] border border-white/15 bg-[#262626] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-[#2d2d2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-[#10101f]">
              G
            </span>
            {isLoading ? t("auth.loading") : t("auth.googleButton")}
          </button>

          <div className="pt-4 text-center">
            <Link to="/login" className="text-sm font-semibold text-[#3ea6ff] hover:underline">
              {t("auth.switchToLogin")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
