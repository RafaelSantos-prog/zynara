import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  onSend: (content: string) => Promise<unknown> | void;
  disabled?: boolean;
};

export function Composer({ onSend, disabled }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setValue("");
    await onSend(trimmed);
  };

  return (
    <div className="glass-panel mt-4 rounded-[28px] p-3">
      <div className="flex items-end gap-3">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("chat.placeholder")}
          rows={3}
          className="min-h-[96px] flex-1 resize-none rounded-[22px] border border-white/10 bg-[#0f1020]/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-violet-400/30"
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey || !event.shiftKey)) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        <button
          type="button"
          onClick={() => void submit()}
          disabled={disabled}
          className="rounded-[22px] bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-4 text-sm font-semibold text-white shadow-glow transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("chat.send")}
        </button>
      </div>
      <p className="mt-2 text-xs text-white/40">Enter envia; Shift+Enter cria nova linha; Ctrl/Cmd + Enter também funciona.</p>
    </div>
  );
}
