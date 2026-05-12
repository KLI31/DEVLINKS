import { linksApi } from "@/lib/api/links.api";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { GitHubCard } from "@/components/dashboard/GitHubCard";
import { RecentLinksCard } from "@/components/dashboard/RecentLinksCard";
import { GithubLoginSync } from "@/components/dashboard/GithubLoginSync";

export default async function DashboardPage() {
  const links = await linksApi.getAll();

  return (
    <div className="flex flex-col gap-4">
      <GithubLoginSync />
      <WelcomeCard />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GitHubCard />
        <RecentLinksCard links={links} />
      </div>
    </div>
  );
}
