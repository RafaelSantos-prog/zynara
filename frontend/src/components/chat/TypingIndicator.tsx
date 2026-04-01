import { useTranslation } from "react-i18next";

export function TypingIndicator() {
  const { t } = useTranslation();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
      <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
      {t("chat.typing")}
    </div>
  );
}
