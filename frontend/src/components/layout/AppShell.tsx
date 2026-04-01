import type { PropsWithChildren } from "react";
import { Header } from "./Header";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

