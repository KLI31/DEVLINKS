"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import type { ClicksTimelinePoint, ReferrerStat, CountryStat } from "@/types/analytics";

const ClicksAreaChart = dynamic(
  () =>
    import("@/components/analytics/ClicksAreaChart").then((m) => ({
      default: m.ClicksAreaChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const ReferrersDonutChart = dynamic(
  () =>
    import("@/components/analytics/ReferrersDonutChart").then((m) => ({
      default: m.ReferrersDonutChart,
    })),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const ClicksWorldMap = dynamic(
  () =>
    import("@/components/analytics/ClicksWorldMap").then((m) => ({
      default: m.ClicksWorldMap,
    })),
  { ssr: false, loading: () => <ChartSkeleton className="h-[380px]" /> },
);

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-border/70 bg-card p-4 shadow-[var(--shadow-card)] ${className ?? ""}`}
    >
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-[300px] animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

interface AnalyticsChartsProps {
  timeline: ClicksTimelinePoint[];
  referrers: ReferrerStat[];
  countries: CountryStat[];
  accentColor: string;
  totalClicks: number;
}

export function AnalyticsCharts({
  timeline,
  referrers,
  countries,
  accentColor,
  totalClicks,
}: AnalyticsChartsProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <ClicksAreaChart data={timeline} accentColor={accentColor} />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<ChartSkeleton />}>
            <ReferrersDonutChart
              data={referrers}
              accentColor={accentColor}
              totalClicks={totalClicks}
            />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<ChartSkeleton className="h-[380px]" />}>
        <ClicksWorldMap countries={countries} accentColor={accentColor} />
      </Suspense>
    </>
  );
}
