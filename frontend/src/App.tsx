import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Onboarding } from "@/pages/Onboarding";
import { Chat } from "@/pages/Chat";
import { Pricing } from "@/pages/Pricing";
import { About } from "@/pages/About";
import { PaymentMock } from "@/pages/PaymentMock";
import { useAuthStore } from "@/store/authStore";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

function PublicRoute({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="glass-panel rounded-[28px] px-6 py-4 text-sm text-white/70">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/chat" replace />;
  }
  return children;
}

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppShell>
            <Landing />
          </AppShell>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/pricing" element={<AppShell><Pricing /></AppShell>} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/about" element={<AppShell><About /></AppShell>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<AppShell><Onboarding /></AppShell>} />
          <Route path="/payment/mock-checkout/:subscriptionId" element={<PaymentMock />} />
        </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
