"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          className: "ll-glass !rounded-lg !border !border-border"
        }}
      />
    </SessionProvider>
  );
}
