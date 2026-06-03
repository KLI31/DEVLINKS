"use client";

import { useEffect } from "react";
import { Terminal, RefreshCw } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card shadow-sm">
          <Terminal className="size-10 text-destructive" />
        </div>

        <h1 className="mb-2 font-mono text-4xl font-bold text-foreground">
          500
        </h1>
        <p className="mb-1 text-lg font-semibold text-foreground">
          Error inesperado
        </p>
        <p className="mb-8 font-mono text-sm text-muted-foreground">
          Algo salió mal al cargar la página.
          {error.digest && (
            <span className="block mt-1 text-xs opacity-60">
              ref: {error.digest}
            </span>
          )}
        </p>

        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RefreshCw className="size-4" />
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}
