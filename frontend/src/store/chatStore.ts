import { create } from "zustand";
import { createChatSession, deleteChatSession, fetchChatHistory, fetchChatSessions, sendChatMessage, type ChatMessage, type ChatSession } from "@/services/chat";
import { useAuthStore } from "./authStore";

type ChatState = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  messagesBySession: Record<string, ChatMessage[]>;
  lastReplySource: "gemini" | "fallback" | null;
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
  loadSessions: () => Promise<void>;
  openSession: (sessionId: string) => Promise<void>;
  createSession: () => Promise<ChatSession | null>;
  deleteSession: (sessionId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<string | void>;
  setActiveSession: (sessionId: string | null) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messagesBySession: {},
  lastReplySource: null,
  isTyping: false,
  isLoading: false,
  error: null,
  reset: () => {
    set({
      sessions: [],
      activeSessionId: null,
      messagesBySession: {},
      lastReplySource: null,
      isTyping: false,
      isLoading: false,
      error: null
    });
  },
  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetchChatSessions();
      const sessions = response.data;
      set({
        sessions,
        activeSessionId: get().activeSessionId ?? sessions[0]?.id ?? null,
        isLoading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to load sessions",
        isLoading: false
      });
    }
  },
  openSession: async (sessionId: string) => {
    set({ activeSessionId: sessionId });
    const cached = get().messagesBySession[sessionId];
    if (cached?.length) {
      return;
    }

    try {
      const response = await fetchChatHistory(sessionId);
      set((state) => ({
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId]: response.data
        }
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to load session history"
      });
    }
  },
  createSession: async () => {
    try {
      const response = await createChatSession();
      set((state) => ({
        sessions: [response.data, ...state.sessions],
        activeSessionId: response.data.id
      }));
      return response.data;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to create session" });
      return null;
    }
  },
  deleteSession: async (sessionId: string) => {
    try {
      await deleteChatSession(sessionId);
      set((state) => {
        const remainingSessions = state.sessions.filter((session) => session.id !== sessionId);
        const remainingMessagesBySession = { ...state.messagesBySession };
        delete remainingMessagesBySession[sessionId];

        const nextActiveSessionId =
          state.activeSessionId === sessionId
            ? remainingSessions[0]?.id ?? null
            : state.activeSessionId;

        return {
          sessions: remainingSessions,
          messagesBySession: remainingMessagesBySession,
          activeSessionId: nextActiveSessionId,
          lastReplySource: null
        };
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unable to delete session" });
    }
  },
  sendMessage: async (content: string) => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: "Missing authentication token" });
      return;
    }

    let sessionId = get().activeSessionId;
    if (!sessionId) {
      const created = await get().createSession();
      sessionId = created?.id ?? null;
    }

    if (!sessionId) {
      return;
    }

    set({ isTyping: true, error: null });
    try {
      const response = await sendChatMessage(sessionId, content);
      if (response.data.replySource === "fallback") {
        console.info("[zynara] resposta veio do fallback local");
      }
      const history = await fetchChatHistory(sessionId);
      set((state) => ({
        isTyping: false,
        lastReplySource: response.data.replySource ?? "gemini",
        messagesBySession: {
          ...state.messagesBySession,
          [sessionId!]: history.data
        },
        sessions: state.sessions.map((session) =>
          session.id === sessionId ? { ...session, updatedAt: new Date().toISOString() } : session
        )
      }));
      return response.data.reply;
    } catch (error) {
      set({
        isTyping: false,
        error: error instanceof Error ? error.message : "Unable to send message"
      });
    }
  },
  setActiveSession: (sessionId: string | null) => {
    set({ activeSessionId: sessionId });
  }
}));
