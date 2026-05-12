import { MousePointer2, Eye, Globe, TrendingUp } from "lucide-react";
import type { AnalyticsSummary } from "@/types/analytics";

interface StatCardsProps {
  summary: AnalyticsSummary;
}

export function StatCards({ summary }: StatCardsProps) {
  const cards = [
    {
      label: "Total clics",
      value: summary.totalClicks,
      icon: MousePointer2,
      description: "eventos registrados",
    },
    {
      label: "Vistas del perfil",
      value: summary.profileViews,
      icon: Eye,
      description: "visitas únicas",
    },
    {
      label: "Países alcanzados",
      value: summary.countriesReached,
      icon: Globe,
      description: "cobertura geográfica",
    },
    {
      label: "Link más activo",
      value: summary.topLink?.title ?? "—",
      subValue: summary.topLink
        ? `${summary.topLink.clicks} clics`
        : "sin datos aún",
      icon: TrendingUp,
      description: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isNumber = typeof card.value === "number";

        return (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-xl border border-border/60 bg-card shadow-(--shadow-card) transition-shadow hover:shadow-md"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-xl opacity-60 transition-opacity group-hover:opacity-100" />

            <div className="pointer-events-none absolute -bottom-3 -right-3 h-16 w-16 rounded-full opacity-[0.07]" />

            <div className="relative flex flex-col gap-3 p-4 pt-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {card.label}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span
                  className={
                    isNumber
                      ? "font-mono text-2xl font-bold leading-none tracking-tight text-foreground"
                      : "line-clamp-1 text-base font-semibold leading-snug text-foreground"
                  }
                >
                  {isNumber ? card.value.toLocaleString("es-ES") : card.value}
                </span>
                {card.subValue && (
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {card.subValue}
                  </span>
                )}
                {card.description && (
                  <span className="text-[11px] text-muted-foreground/60">
                    {card.description}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
