"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useReducedMotion } from "motion/react";
import type { DeviceStat } from "@/types/analytics";

interface DevicesBarChartProps {
  data: DeviceStat[];
  accentColor: string;
}

export function DevicesBarChart({ data, accentColor }: DevicesBarChartProps) {
  const isReducedMotion = useReducedMotion();

  if (data.length === 0) {
    return (
      <div className="flex w-full flex-col rounded-xl border border-border/70 bg-card p-5 shadow-(--shadow-card)">
        <h3 className="font-medium">Dispositivos</h3>
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Sin datos de dispositivos</p>
        </div>
      </div>
    );
  }

  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div className="flex w-full flex-col rounded-xl border border-border/70 bg-card p-5 shadow-(--shadow-card)">
      <h3 className="font-medium">Dispositivos</h3>
      <div className="mt-4 flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              stroke="var(--border)"
            />
            <YAxis
              type="category"
              dataKey="device"
              width={70}
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
              formatter={(value) => [value, "Clics"]}
            />
            <Bar
              dataKey="count"
              fill={accentColor}
              radius={[0, 4, 4, 0]}
              isAnimationActive={!isReducedMotion}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

