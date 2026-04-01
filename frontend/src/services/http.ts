const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export function getApiUrl() {
  return API_URL;
}

export function getAuthToken() {
  return localStorage.getItem("zynara-token");
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("zynara-token", token);
  } else {
    localStorage.removeItem("zynara-token");
  }
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {})
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error ?? payload?.message ?? "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

