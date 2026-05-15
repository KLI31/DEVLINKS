import { analyticsApi, userApi } from "@/lib/api";
import { StatCards } from "@/components/analytics/StatCards";
import { LinksProgressList } from "@/components/analytics/LinksProgressList";
import { DevicesBarChart } from "@/components/analytics/DevicesBarChart";
import { RangeSelectorTabs } from "@/components/analytics/RangeSelectorTabs";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";

interface AnalyticsPageProps {
  searchParams?: Promise<{ days?: string }>;
}

function parseDays(days: string | undefined): 7 | 30 | 90 {
  const num = Number.parseInt(days ?? "30", 10);
  if (num === 7 || num === 30 || num === 90) return num;
  return 30;
}

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const params = await searchParams;
  const days = parseDays(params?.days);

  const user = await userApi.me().catch(() => null);
  const accentColor = user?.accentColor || "var(--primary)";

  const results = await Promise.allSettled([
    analyticsApi.getSummary(days),
    analyticsApi.getClicksTimeline(days),
    analyticsApi.getLinksStats(days),
    analyticsApi.getCountries(days),
    analyticsApi.getReferrers(days),
    analyticsApi.getDevices(days),
  ]);

  const [summaryRes, timelineRes, linksStatsRes, countriesRes, referrersRes, devicesRes] =
    results;

  const summary = summaryRes.status === "fulfilled" ? summaryRes.value : null;
  const timeline = timelineRes.status === "fulfilled" ? timelineRes.value : [];
  const linksStats = linksStatsRes.status === "fulfilled" ? linksStatsRes.value : [];
  const countries = countriesRes.status === "fulfilled" ? countriesRes.value : [];
  const referrers = referrersRes.status === "fulfilled" ? referrersRes.value : [];
  const devices = devicesRes.status === "fulfilled" ? devicesRes.value : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">Analíticas</h1>
        <RangeSelectorTabs currentDays={days} />
      </div>

      <StatCards summary={summary} />

      <AnalyticsCharts
        timeline={timeline}
        referrers={referrers}
        countries={countries}
        accentColor={accentColor}
        totalClicks={summary?.totalClicks ?? 0}
      />

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        <div className="flex lg:col-span-2">
          <LinksProgressList links={linksStats} accentColor={accentColor} />
        </div>
        <div className="flex">
          <DevicesBarChart data={devices} accentColor={accentColor} />
        </div>
      </div>
    </div>
  );
}
