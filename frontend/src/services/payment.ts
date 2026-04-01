import { apiFetch } from "./http";

export async function subscribeToPro(planId = "pro") {
  return apiFetch<{ success: true; data: { subscription: { id: string; status: string; planId: string }; checkoutUrl: string } }>("/payment/subscribe", {
    method: "POST",
    body: JSON.stringify({ planId })
  });
}

export async function fetchSubscriptionStatus() {
  return apiFetch<{ success: true; data: { status: string; plan: string; expiresAt: string | null } }>("/payment/status");
}

