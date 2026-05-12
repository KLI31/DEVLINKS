"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useReducedMotion } from "motion/react";
import type { ReferrerStat } from "@/types/analytics";

interface ReferrersDonutChartProps {
  data: ReferrerStat[];
  accentColor: string;
  totalClicks: number;
}

const PALETTE = [
  "#0d9488",
  "#9452ff",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
];

export function ReferrersDonutChart({
  data,
  accentColor,
  totalClicks,
}: ReferrersDonutChartProps) {
  const isReducedMotion = useReducedMotion();

  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    if (data.length <= 6) return data;
    const top = data.slice(0, 5);
    const others = data.slice(5);
    const othersCount = others.reduce((sum, r) => sum + r.count, 0);
    return [
      ...top,
      { referrer: "Otros", count: othersCount, percentage: 0 },
    ];
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-medium">Referrers</h3>
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin referrers registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-medium">Referrers</h3>
      <div className="relative mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="referrer"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              isAnimationActive={!isReducedMotion}
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === 0 ? accentColor : PALETTE[i % PALETTE.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
              formatter={(value, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <span className="font-mono text-2xl font-semibold text-foreground">
              {totalClicks.toLocaleString("es-ES")}
            </span>
            <span className="text-xs text-muted-foreground">clics totales</span>
          </div>
        </div>
      </div>
    </div>
  );
}
