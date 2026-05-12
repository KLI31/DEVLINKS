"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useReducedMotion } from "motion/react";
import type { ClicksTimelinePoint } from "@/types/analytics";

interface ClicksAreaChartProps {
  data: ClicksTimelinePoint[];
  accentColor: string;
}

export function ClicksAreaChart({ data, accentColor }: ClicksAreaChartProps) {
  const isReducedMotion = useReducedMotion();

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
        <h3 className="text-sm font-medium">Clics en el tiempo</h3>
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin clics en este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)]">
      <h3 className="text-sm font-medium">Clics en el tiempo</h3>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(value) => {
                const date = new Date(value as string);
                return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
              }}
              stroke="var(--border)"
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
              }}
              labelStyle={{ color: "var(--foreground)" }}
              itemStyle={{ color: "var(--foreground)" }}
              formatter={(value) => [value, "Clics"]}
              labelFormatter={(label) => {
                const date = new Date(label as string);
                return date.toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={accentColor}
              fill="url(#clicksGrad)"
              strokeWidth={2}
              isAnimationActive={!isReducedMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
