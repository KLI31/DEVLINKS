import { linksApi } from "@/lib/api/links.api";
import { analyticsApi } from "@/lib/api/analytics.api";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { GitHubCard } from "@/components/dashboard/GitHubCard";
import { RecentLinksCard } from "@/components/dashboard/RecentLinksCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { GithubLoginSync } from "@/components/dashboard/GithubLoginSync";
import { ClicksAreaChart } from "@/components/analytics/ClicksAreaChart";

export default async function DashboardPage() {
  const [links, summary, timeline, linksStats] = await Promise.all([
    linksApi.getAll().catch(() => [] as import("@/types").LinkItem[]),
    analyticsApi.getSummary(30).catch(() => null),
    analyticsApi.getClicksTimeline(30).catch(() => []),
    analyticsApi.getLinksStats(30).catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-4 md:gap-5 [&>*]:motion-safe:animate-in [&>*]:motion-safe:fade-in [&>*]:motion-safe:slide-in-from-bottom-2 [&>*]:duration-300 [&>*]:fill-mode-both">
      <GithubLoginSync />
      <WelcomeCard linksCount={links.length} />
      <div className="grid grid-cols-1 items-start gap-4 delay-75 md:gap-5 xl:grid-cols-[minmax(0,1fr)_22rem] [&>*]:min-w-0 xl:[&>*]:col-start-1">
        <QuickStats summary={summary} />
        <ClicksAreaChart data={timeline} accentColor="var(--primary)" />
        <div className="xl:col-start-2! xl:row-span-3 xl:row-start-1 xl:self-stretch">
          <GitHubCard />
        </div>
        <RecentLinksCard links={links} stats={linksStats} />
      </div>
    </div>
  );
}
