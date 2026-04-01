import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supportedLanguages } from "@/i18n";

const navLinks = [
  { to: "/", key: "home" },
  { to: "/pricing", key: "pricing" },
  { to: "/chat", key: "chat" },
  { to: "/dashboard", key: "dashboard" }
];

export function Header() {
  const { t, i18n } = useTranslation();
  const { user, signOut, setLanguage } = useAuth();
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  if (isAuthPage) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070712]/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 shadow-[0_0_40px_rgba(181,92,255,0.55)]" />
          </div>
          <div>
            <p className="hero-title text-lg font-semibold tracking-tight">Zynara</p>
            <p className="text-xs text-white/60">ethical presence system</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition ${isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`
              }
            >
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 sm:flex">
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  i18n.language === lang ? "bg-white text-[#10101f]" : "text-white/70 hover:text-white"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {user ? (
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              {t("nav.logout")}
            </button>
          ) : (
            <NavLink
              to="/login"
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.01]"
            >
              {t("nav.login")}
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}
