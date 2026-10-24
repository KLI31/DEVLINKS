"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, GitFork, ArrowUpRight, ExternalLink, Folder, User, Activity, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { githubApi, getDevIconUrl } from "@/lib/api/github.api";
import { userApi } from "@/lib/api/user.api";
import { Panel } from "./Panel";
import type { GithubStats, Project } from "@/types";


const MAX_REPOS = 6;

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "hace un momento";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

function GitHubSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted/50" />
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-24 rounded bg-muted/50" />
          <div className="h-3 w-16 rounded bg-muted/50" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted/50" />
        ))}
      </div>
      <div className="h-20 rounded-lg bg-muted/50" />
    </div>
  );
}

export function GitHubCard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<GithubStats | null>(null);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const githubUsername = user?.githubUsername ?? null;

  useEffect(() => {
    if (!githubUsername) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [data, projects] = await Promise.all([
          githubApi.getStats(githubUsername),
          userApi.getMyProjects().catch(() => [] as Project[]),
        ]);
        if (!cancelled) {
          setStats(data);
          setSavedProjects(projects);
        }
      } catch {
        if (!cancelled) {
          setStats(null);
          setSavedProjects([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [githubUsername]);

  if (!githubUsername) {
    return (
      <Panel className="flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-7 w-7 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-foreground">
            Conecta tu GitHub
          </h3>
          <p className="text-xs text-muted-foreground max-w-[16rem]">
            Muestra tus repos, lenguajes y stats de contribución directamente en
            tu perfil.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            window.location.href = "/api/auth/github";
          }}
        >
          <svg className="h-4 w-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Conectar con GitHub
        </Button>
      </Panel>
    );
  }

  if (loading) {
    return (
      <Panel>
        <GitHubSkeleton />
      </Panel>
    );
  }

  if (!stats) {
    return (
      <Panel className="flex flex-col items-center justify-center gap-3 p-6 text-center">
          <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        <p className="text-sm text-muted-foreground">
          No se pudieron cargar las estadísticas de GitHub.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={() => {
            if (githubUsername) {
              setLoading(true);
              githubApi
                .getStats(githubUsername)
                .then(setStats)
                .catch(() => setStats(null))
                .finally(() => setLoading(false));
            }
          }}
        >
          Reintentar
        </Button>
      </Panel>
    );
  }

  const uniqueSavedProjects = Array.from(
    new Map(savedProjects.map((p) => [p.id, p])).values(),
  );

  const isAuto = uniqueSavedProjects.length === 0;
  const repos = (
    isAuto
      ? stats.topRepos.map((r) => ({
          id: String(r.id),
          name: r.name,
          url: r.html_url,
          description: r.description,
          stars: r.stargazers_count,
          forks: r.forks_count,
          pushedAt: formatTimeAgo(new Date(r.pushed_at).getTime()),
          language: r.language,
        }))
      : uniqueSavedProjects.map((p) => ({
          id: p.id,
          name: p.title,
          url: p.url,
          description: p.description,
          stars: p.stars,
          forks: null,
          pushedAt: null,
          language: p.language,
        }))
  ).slice(0, MAX_REPOS);

  return (
    <Panel className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-foreground">GitHub</h2>
          <span className="text-xs text-muted-foreground">
            @{stats.user.login} · actualizado {formatTimeAgo(stats.fetchedAt)}
          </span>
        </div>
        <a
          href={`https://github.com/${stats.user.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Ver más
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { value: stats.totalRepos, label: "Repos", icon: Folder },
          { value: stats.followers, label: "Followers", icon: User },
          { value: stats.totalContributions, label: "Contrib.", icon: Activity },
        ].map(({ value, label, icon: Icon }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl bg-card px-2 py-3"
          >
            <span className="font-mono text-lg font-bold text-foreground">{value}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Icon className="h-3 w-3" />
              {label}
            </span>
          </div>
        ))}
      </div>

      {repos.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <h3 className="flex items-center gap-1.5 text-xs font-medium text-foreground">
            {isAuto ? "Top repos" : "Repos destacados"}
            {isAuto && (
              <span
                className="inline-flex items-center gap-0.5 text-[10px] font-normal text-muted-foreground"
                title="Selecciona tus repos en Personalización"
              >
                <Info className="size-3" />
                auto
              </span>
            )}
          </h3>
          <ul className="flex flex-1 flex-col gap-2">
            {repos.map((repo) => {
              const icon = repo.language ? getDevIconUrl(repo.language) : null;
              return (
                <li key={repo.id} className="flex flex-1">
                  <a
                    href={repo.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex min-h-11 w-full flex-col justify-between gap-3 rounded-xl bg-card p-4 transition-colors hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                          {icon ? (
                            <Image
                              src={icon}
                              alt={repo.language ?? ""}
                              width={16}
                              height={16}
                              unoptimized
                              className="object-contain"
                            />
                          ) : (
                            <Folder className="size-4 text-muted-foreground" />
                          )}
                        </span>
                        <span
                          title={repo.name}
                          className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground"
                        >
                          {repo.name}
                        </span>
                        <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {repo.description || "Sin descripción"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Star className="size-3 fill-warning text-warning" />
                        {repo.stars}
                      </span>
                      {repo.forks !== null && (
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="size-3" />
                          {repo.forks}
                        </span>
                      )}
                      {repo.language && <span>{repo.language}</span>}
                      {repo.pushedAt && <span className="ms-auto">{repo.pushedAt}</span>}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Panel>
  );
}
