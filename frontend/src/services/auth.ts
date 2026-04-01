import { apiFetch } from "./http";

export type AuthUser = {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  lang: "pt-BR" | "en-US" | "es";
  plan: "free" | "pro" | string;
  onboardingComplete?: boolean;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export type ConventionalAuthPayload = {
  name?: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginWithGoogleToken(idToken: string) {
  return apiFetch<{ success: true; data: AuthSession }>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken })
  });
}

export async function registerWithEmail(payload: Required<Pick<ConventionalAuthPayload, "name" | "email" | "password">>) {
  return apiFetch<{ success: true; data: AuthSession }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginWithEmail(payload: LoginPayload) {
  return apiFetch<{ success: true; data: AuthSession }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchProfile() {
  return apiFetch<{ success: true; data: AuthUser & { onboardingComplete: boolean } }>("/user/profile");
}

export async function updateLanguage(lang: AuthUser["lang"]) {
  return apiFetch<{ success: true; data: AuthUser }>("/user/profile", {
    method: "PATCH",
    body: JSON.stringify({ lang })
  });
}

export async function saveOnboardingAnswers(answers: Array<{ questionKey: string; answer: string }>) {
  return apiFetch<{ success: true; data: { completed: boolean; onboardingComplete: boolean } }>("/user/onboarding", {
    method: "POST",
    body: JSON.stringify({ answers })
  });
}

export async function fetchOnboardingAnswers() {
  return apiFetch<{ success: true; data: Array<{ id: string; questionKey: string; answer: string; answeredAt: string }> }>("/user/onboarding");
}

export function getDemoIdToken() {
  const payload = {
    googleId: "demo-google-id",
    email: "demo@zynara.app",
    name: "Zynara Demo",
    avatarUrl: null
  };

  const base64 = btoa(JSON.stringify(payload));
  const base64Url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
  return `demo:${base64Url}`;
}
