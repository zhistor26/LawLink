"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";

export function AppShell({
  children,
  banner
}: {
  children: React.ReactNode;
  /** v0.27: 顶部公告 banner（服务端渲染好后注入） */
  banner?: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <div className="md:pl-60">
        <Topbar onMobileMenuToggle={() => setMobileNavOpen(true)} />
        {banner}
        <main className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
