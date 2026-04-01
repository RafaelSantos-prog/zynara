import { apiFetch } from "./http";

export type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  messages?: Array<{ id: string; role: "user" | "assistant"; content: string; sentAt: string }>;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sentAt: string;
};

export async function createChatSession() {
  return apiFetch<{ success: true; data: ChatSession }>("/chat/session", {
    method: "POST"
  });
}

export async function fetchChatSessions() {
  return apiFetch<{ success: true; data: ChatSession[] }>("/chat/sessions");
}

export async function deleteChatSession(sessionId: string) {
  return apiFetch<{ success: true; data: { id: string } }>(`/chat/sessions/${sessionId}`, {
    method: "DELETE"
  });
}

export async function fetchChatHistory(sessionId: string) {
  return apiFetch<{ success: true; data: ChatMessage[] }>(`/chat/history/${sessionId}`);
}

export async function sendChatMessage(sessionId: string, content: string) {
  return apiFetch<{ success: true; data: { reply: string; replySource?: "gemini" | "fallback"; assistantMessage: ChatMessage } }>("/chat/send", {
    method: "POST",
    body: JSON.stringify({ sessionId, content })
  });
}
