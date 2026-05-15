"use client";

import { useEffect } from "react";
import { Terminal } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface-2 shadow-card">
        <Terminal className="size-8 text-error" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">
        Algo salió mal
      </h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        No pudimos cargar tus analíticas. Intenta de nuevo o vuelve al dashboard.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/dashboard"
          className="rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-3"
        >
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
