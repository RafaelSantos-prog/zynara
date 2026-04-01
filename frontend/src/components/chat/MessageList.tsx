import { useTranslation } from "react-i18next";
import type { ChatMessage } from "@/services/chat";

type Props = {
  messages: ChatMessage[];
};

export function MessageList({ messages }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[420px] flex-1 flex-col gap-4 overflow-y-auto rounded-[28px] border border-white/10 bg-[rgba(16,16,32,0.74)] p-4 shadow-glow scrollbar">
      {messages.length === 0 ? (
        <div className="m-auto max-w-md rounded-[24px] border border-white/10 bg-white/5 p-6 text-center text-white/60">
          {t("chat.emptyState")}
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" ? (
              <div className="flex max-w-[86%] items-end gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-[10px] font-bold text-white shadow-glow">
                  Z
                </div>
                <div className="rounded-[24px] bg-white/10 px-4 py-3 text-sm leading-6 text-white/80 ring-1 ring-white/10">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ) : (
              <div className="max-w-[80%] rounded-[24px] bg-gradient-to-br from-violet-500 to-fuchsia-600 px-4 py-3 text-sm leading-6 text-white">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
