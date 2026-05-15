import { Terminal, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UserNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-surface-2 shadow-card">
          <Terminal className="size-10 text-error" />
        </div>

        <h1 className="mb-2 font-mono text-5xl font-bold text-foreground">
          404
        </h1>

        <p className="mb-1 text-lg font-semibold text-foreground">
          Usuario no encontrado
        </p>

        <p className="mb-8 font-mono text-sm text-muted-foreground">
          El perfil que buscas no existe en DevLinks.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Home className="size-4" />
            Volver al inicio
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-3"
          >
            <ArrowLeft className="size-4" />
            Regresar
          </Link>
        </div>
      </div>
    </main>
  );
}
