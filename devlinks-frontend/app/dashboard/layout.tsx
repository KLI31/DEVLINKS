"use client";

import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col gap-4 p-4 md:gap-5 md:p-5">
      <Topbar />
      <div className="flex min-h-0 min-w-0 flex-1 gap-4 md:gap-5">
        <Sidebar />
        <main className="flex min-h-0 min-w-0 flex-1 bg-background flex-col overflow-hidden rounded-2xl border border-border/70 text-card-foreground shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] transition-shadow duration-300 dark:ring-white/[0.06] md:rounded-3xl">
          <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-6 md:p-8 bg-background">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
