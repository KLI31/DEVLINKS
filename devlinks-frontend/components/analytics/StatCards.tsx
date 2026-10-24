import type { AnalyticsSummary } from "@/types/analytics";
import { Panel } from "@/components/dashboard/Panel";

interface StatCardsProps {
  summary: AnalyticsSummary | null;
}

export function StatCards({ summary }: StatCardsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Panel key={i} className="flex flex-col gap-3">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </Panel>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total clics",
      value: summary.totalClicks.toLocaleString("es-ES"),
      description: "eventos registrados",
    },
    {
      label: "Vistas del perfil",
      value: summary.profileViews.toLocaleString("es-ES"),
      description: "visitas únicas",
    },
    {
      label: "Países alcanzados",
      value: summary.countriesReached.toLocaleString("es-ES"),
      description: "cobertura geográfica",
    },
    {
      label: "Link más activo",
      value: summary.topLink?.title ?? "—",
      description: summary.topLink
        ? `${summary.topLink.clicks.toLocaleString("es-ES")} clics`
        : "sin datos aún",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, description }) => (
        <Panel key={label} className="flex min-w-0 flex-col gap-3">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="truncate font-mono text-3xl font-bold leading-none tabular-nums text-foreground">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </Panel>
      ))}
    </div>
  );
}
