import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const auth = useAuthStore();
  const { i18n } = useTranslation();

  const setLanguage = useCallback(async (lang: "pt-BR" | "en-US" | "es") => {
    await auth.updateLanguage(lang);
    await i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
  }, [auth.updateLanguage, i18n]);

  return {
    ...auth,
    setLanguage
  };
}
