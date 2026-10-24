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
import { ArrowDown, ArrowUp } from "lucide-react";
import { Panel } from "@/components/dashboard/Panel";
import { cn } from "@/lib/utils";
import type { ClicksTimelinePoint } from "@/types/analytics";

interface ClicksAreaChartProps {
  data: ClicksTimelinePoint[];
  accentColor: string;
}

const sum = (points: ClicksTimelinePoint[]) =>
  points.reduce((acc, p) => acc + p.count, 0);

export function ClicksAreaChart({ data, accentColor }: ClicksAreaChartProps) {
  const isReducedMotion = useReducedMotion();

  if (data.length === 0) {
    return (
      <Panel>
        <h3 className="text-sm font-medium text-foreground">Clics en el tiempo</h3>
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Sin clics en este período</p>
        </div>
      </Panel>
    );
  }

  // Sin periodo previo en la API: se compara la segunda mitad del rango contra la primera.
  const half = Math.floor(data.length / 2);
  const previous = sum(data.slice(0, half));
  const current = sum(data.slice(half));
  const delta = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

  return (
    <Panel>
      <h3 className="text-sm font-medium text-foreground">Clics en el tiempo</h3>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-4xl font-bold leading-none tabular-nums text-foreground">
          {sum(data).toLocaleString("es-ES")}
        </span>
        {delta !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              delta >= 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {Math.abs(delta)}%
            {delta >= 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
          </span>
        )}
        {delta !== null && (
          <span className="text-xs text-muted-foreground">vs. periodo anterior</span>
        )}
      </div>
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={accentColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={(value) => {
                const date = new Date(value as string);
                return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
              }}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              minTickGap={24}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: accentColor, strokeDasharray: "4 4" }}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "0.75rem",
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
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
              isAnimationActive={!isReducedMotion}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
