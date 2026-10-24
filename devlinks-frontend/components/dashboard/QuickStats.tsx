import Link from "next/link";
import type { AnalyticsSummary } from "@/types/analytics";
import { Panel } from "./Panel";

interface QuickStatsProps {
  summary: AnalyticsSummary | null;
}

export function QuickStats({ summary }: QuickStatsProps) {
  const stats = [
    { label: "Total clics", value: summary?.totalClicks },
    { label: "Vistas del perfil", value: summary?.profileViews },
    { label: "Países alcanzados", value: summary?.countriesReached },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map(({ label, value }) => (
        <Panel key={label} className="flex flex-col gap-3">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="font-mono text-3xl font-bold leading-none tabular-nums text-foreground">
            {value?.toLocaleString("es-ES") ?? "—"}
          </span>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">últimos 30 días</span>
            <Link
              href="/dashboard/analytics"
              className="-my-3 inline-flex min-h-11 items-center text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Ver más
            </Link>
          </div>
        </Panel>
      ))}
    </div>
  );
}
