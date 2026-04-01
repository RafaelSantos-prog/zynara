import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  fetchProfile,
  getDemoIdToken,
  loginWithEmail as loginWithEmailRequest,
  loginWithGoogleToken,
  registerWithEmail as registerWithEmailRequest,
  updateLanguage as updateLangRequest,
  type AuthUser
} from "@/services/auth";
import { setAuthToken } from "@/services/http";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  signInWithGoogle: (idToken?: string) => Promise<AuthUser | null>;
  signInWithEmail: (email: string, password: string) => Promise<AuthUser | null>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<AuthUser | null>;
  signOut: () => void;
  setSession: (user: AuthUser, token: string) => void;
  updateLanguage: (lang: AuthUser["lang"]) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isHydrated: false,
      isLoading: false,
      error: null,
      bootstrap: async () => {
        const token = get().token ?? localStorage.getItem("zynara-token");
        if (!token) {
          set({ isHydrated: true });
          return;
        }

        setAuthToken(token);
        try {
          set({ isLoading: true, error: null });
          const response = await fetchProfile();
          set({
            user: response.data,
            token,
            isHydrated: true,
            isLoading: false
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isHydrated: true,
            isLoading: false,
            error: error instanceof Error ? error.message : "Session expired"
          });
          setAuthToken(null);
        }
      },
      signInWithGoogle: async (idToken = getDemoIdToken()) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginWithGoogleToken(idToken);
          setAuthToken(response.data.token);
          set({
            user: response.data.user,
            token: response.data.token,
            isLoading: false,
            isHydrated: true
          });
          void import("./chatStore").then(({ useChatStore }) => useChatStore.getState().reset());
          return response.data.user;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Unable to sign in"
          });
          return null;
        }
      },
      signInWithEmail: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginWithEmailRequest({ email, password });
          setAuthToken(response.data.token);
          set({
            user: response.data.user,
            token: response.data.token,
            isLoading: false,
            isHydrated: true
          });
          void import("./chatStore").then(({ useChatStore }) => useChatStore.getState().reset());
          return response.data.user;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Unable to sign in"
          });
          return null;
        }
      },
      registerWithEmail: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await registerWithEmailRequest({ name, email, password });
          setAuthToken(response.data.token);
          set({
            user: response.data.user,
            token: response.data.token,
            isLoading: false,
            isHydrated: true
          });
          void import("./chatStore").then(({ useChatStore }) => useChatStore.getState().reset());
          return response.data.user;
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : "Unable to create account"
          });
          return null;
        }
      },
      signOut: () => {
        setAuthToken(null);
        set({
          user: null,
          token: null,
          isLoading: false,
          error: null
        });
        void import("./chatStore").then(({ useChatStore }) => useChatStore.getState().reset());
      },
      setSession: (user, token) => {
        setAuthToken(token);
        set({ user, token });
      },
      updateLanguage: async (lang) => {
        const { token } = get();
        if (!token) {
          return;
        }

        const response = await updateLangRequest(lang);
        set((state) => ({
          user: state.user ? { ...state.user, ...response.data } : response.data
        }));
      }
    }),
    {
      name: "zynara-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
);
