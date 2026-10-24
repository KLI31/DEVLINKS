import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh gap-2 bg-background p-2 md:gap-3 md:p-3">
      <Sidebar />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-card-foreground shadow-[var(--shadow-card)] md:rounded-3xl">
        <Topbar />
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-4 pb-6 md:px-6 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
