import { create } from "zustand";
import {
  createChatSession,
  createGuestChatSession,
  deleteChatSession,
  fetchChatHistory,
  fetchChatSessions,
  sendChatMessage,
  sendGuestChatMessage,
  type ChatMessage,
  type ChatSession
} from "@/services/chat";
import { useAuthStore } from "./authStore";

const DEFAULT_GUEST_LIMIT = 50;

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
  guestSessionId: string | null;
  guestLimit: number;
  guestRemaining: number;
  ensureGuestSession: () => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messagesBySession: {},
  lastReplySource: null,
  isTyping: false,
  isLoading: false,
  error: null,
  guestSessionId: null,
  guestLimit: DEFAULT_GUEST_LIMIT,
  guestRemaining: DEFAULT_GUEST_LIMIT,
  reset: () => {
    set({
      sessions: [],
      activeSessionId: null,
      messagesBySession: {},
      lastReplySource: null,
      isTyping: false,
      isLoading: false,
      error: null,
      guestSessionId: null,
      guestLimit: DEFAULT_GUEST_LIMIT,
      guestRemaining: DEFAULT_GUEST_LIMIT
    });
  },
  loadSessions: async () => {
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ isLoading: false });
      return;
    }

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
    const token = useAuthStore.getState().token;
    if (!token) {
      return;
    }

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
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: "Crie uma conta gratuita para ter múltiplas sessões." });
      return null;
    }

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
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ error: "Exclusão de sessões está disponível após login." });
      return;
    }

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
      if (get().guestRemaining <= 0) {
        set({ error: "Limite de mensagens do modo visitante atingido. Faça login para continuar." });
        return;
      }

      if (!get().guestSessionId) {
        await get().ensureGuestSession();
      }

      const sessionId = get().guestSessionId;
      if (!sessionId) {
        set({ error: "Não foi possível iniciar o modo visitante." });
        return;
      }

      set({ isTyping: true, error: null });
      try {
        const response = await sendGuestChatMessage(sessionId, content);
        set((state) => ({
          isTyping: false,
          lastReplySource: response.data.replySource ?? "gemini",
          guestSessionId: response.data.sessionId,
          guestLimit: response.data.limit,
          guestRemaining: response.data.remaining,
          messagesBySession: {
            ...state.messagesBySession,
            [response.data.sessionId]: response.data.messages
          },
          sessions: state.sessions.length
            ? state.sessions.map((session) =>
              session.id === response.data.sessionId
                ? { ...session, updatedAt: new Date().toISOString() }
                : session
            )
            : [{
              id: response.data.sessionId,
              title: "Sessão visitante",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }],
          activeSessionId: response.data.sessionId
        }));
        return response.data.reply;
      } catch (error) {
        set({
          isTyping: false,
          error: error instanceof Error ? error.message : "Unable to send message"
        });
      }
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
  },
  ensureGuestSession: async () => {
    const token = useAuthStore.getState().token;
    if (token) {
      return;
    }

    if (get().guestSessionId) {
      return;
    }

    try {
      const response = await createGuestChatSession();
      set({
        guestSessionId: response.data.sessionId,
        guestLimit: response.data.limit,
        guestRemaining: response.data.remaining,
        sessions: [{
          id: response.data.sessionId,
          title: "Sessão visitante",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }],
        activeSessionId: response.data.sessionId
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to start guest session"
      });
    }
  }
}));
