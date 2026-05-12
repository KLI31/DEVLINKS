import { analyticsApi, userApi } from "@/lib/api";
import { StatCards } from "@/components/analytics/StatCards";
import { ClicksAreaChart } from "@/components/analytics/ClicksAreaChart";
import { ReferrersDonutChart } from "@/components/analytics/ReferrersDonutChart";
import { ClicksWorldMap } from "@/components/analytics/ClicksWorldMap";
import { LinksProgressList } from "@/components/analytics/LinksProgressList";
import { DevicesBarChart } from "@/components/analytics/DevicesBarChart";
import { RangeSelectorTabs } from "@/components/analytics/RangeSelectorTabs";

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

  const [user, summary, timeline, linksStats, countries, referrers, devices] =
    await Promise.all([
      userApi.me(),
      analyticsApi.getSummary(days),
      analyticsApi.getClicksTimeline(days),
      analyticsApi.getLinksStats(days),
      analyticsApi.getCountries(days),
      analyticsApi.getReferrers(days),
      analyticsApi.getDevices(days),
    ]);

  const accentColor = user.accentColor || "var(--primary)";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">Analíticas</h1>
        <RangeSelectorTabs currentDays={days} />
      </div>

      <StatCards summary={summary} accentColor={accentColor} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ClicksAreaChart data={timeline} accentColor={accentColor} />
        </div>
        <div>
          <ReferrersDonutChart
            data={referrers}
            accentColor={accentColor}
            totalClicks={summary.totalClicks}
          />
        </div>
      </div>

      <ClicksWorldMap countries={countries} accentColor={accentColor} />

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
