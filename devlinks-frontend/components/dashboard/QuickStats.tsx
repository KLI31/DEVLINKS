import { Link2, LayoutList, Link } from "lucide-react";
import type { LinkItem, GithubStats } from "@/types";

interface QuickStatsProps {
  links: LinkItem[];
  githubStats: GithubStats | null;
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

function GithubMarkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.47c.53.1.72-.23.72-.5v-1.96c-2.94.64-3.56-1.25-3.56-1.25-.48-1.2-1.17-1.52-1.17-1.52-.96-.65.07-.64.07-.64 1.05.08 1.6 1.08 1.6 1.08.94 1.6 2.45 1.14 3.05.87.1-.68.37-1.14.66-1.4-2.35-.27-4.82-1.17-4.82-5.23 0-1.16.42-2.1 1.1-2.84-.1-.27-.47-1.37.1-2.86 0 0 .9-.28 2.95 1.08a10.2 10.2 0 0 1 5.36 0c2.04-1.36 2.94-1.08 2.94-1.08.58 1.5.22 2.6.1 2.86.7.74 1.12 1.68 1.12 2.84 0 4.07-2.47 4.95-4.84 5.2.38.33.72.96.72 1.95v2.88c0 .3.2.6.73.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold font-mono text-foreground">
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function QuickStats({ links, githubStats }: QuickStatsProps) {
  const activeLinks = links.filter((l) => l.isActive).length;
  const totalLinks = links.length;
  const totalRepos = githubStats?.totalRepos ?? "—";

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatItem
        icon={<Link className="h-5 w-5" />}
        value={activeLinks}
        label="Links activos"
      />
      <StatItem
        icon={<LayoutList className="h-5 w-5" />}
        value={`${totalLinks} / 20`}
        label="Total links"
      />
      <StatItem
        icon={<GithubMarkIcon />}
        value={totalRepos}
        label="Repos GitHub"
      />
    </div>
  );
}
