"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Star, ExternalLink, Folder, User, Activity, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { githubApi, getDevIconUrl } from "@/lib/api/github.api";
import { userApi } from "@/lib/api/user.api";
import type { GithubStats, Project } from "@/types";


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

function LanguageBar({
  language,
  pct,
  color,
}: {
  language: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{language}</span>
        <span className="font-mono text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color || "hsl(var(--primary))" }}
        />
      </div>
    </div>
  );
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
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/70 bg-card p-6 text-center">
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
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-4">
        <GitHubSkeleton />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/70 bg-card p-6 text-center">
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
      </div>
    );
  }

  const topLanguages = stats.topLanguages.slice(0, 3);
  const displayRepos = savedProjects.length > 0
    ? null
    : stats.topRepos.slice(0, 3);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={stats.user.avatar_url}
            alt={stats.user.login}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              {stats.user.name || stats.user.login}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              @{stats.user.login}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground">
          actualizado {formatTimeAgo(stats.fetchedAt)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-lg border border-border/60 bg-muted/30 px-2 py-2.5">
          <span className="text-lg font-bold font-mono text-foreground">
            {stats.totalRepos}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Folder className="h-3 w-3" />
            Repos
          </span>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-border/60 bg-muted/30 px-2 py-2.5">
          <span className="text-lg font-bold font-mono text-foreground">
            {stats.followers}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <User className="h-3 w-3" />
            Followers
          </span>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-border/60 bg-muted/30 px-2 py-2.5">
          <span className="text-lg font-bold font-mono text-foreground">
            {stats.totalContributions}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Activity className="h-3 w-3" />
            Contribuciones
          </span>
        </div>
      </div>

      {topLanguages.length > 0 && (
        <div className="flex flex-col gap-2">
          <h4 className="text-xs font-medium text-foreground">
            Top lenguajes
          </h4>
          {topLanguages.map((lang) => (
            <LanguageBar
              key={lang.language}
              language={lang.language}
              pct={lang.pct}
              color={lang.color}
            />
          ))}
        </div>
      )}

      {(savedProjects.length > 0 || (displayRepos && displayRepos.length > 0)) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-medium text-foreground">
              {savedProjects.length > 0 ? "Repos destacados" : "Top repos"}
            </h4>
            {savedProjects.length === 0 && (
              <span
                className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground"
                title="Selecciona tus repos en Personalización"
              >
                <Info className="size-3" />
                auto
              </span>
            )}
          </div>
          {savedProjects.length > 0
            ? savedProjects.map((project) => (
                <a
                  key={project.id}
                  href={project.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {project.title}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="font-mono text-xs text-muted-foreground">
                        {project.stars}
                      </span>
                    </div>
                  </div>
                  {project.description && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {project.language && (
                    <div className="flex items-center gap-1.5">
                      {getDevIconUrl(project.language) ? (
                        <Image
                          src={getDevIconUrl(project.language)!}
                          alt={project.language}
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      ) : (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              stats.topLanguages.find(
                                (l) => l.language === project.language,
                              )?.color || "hsl(var(--primary))",
                          }}
                        />
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {project.language}
                      </span>
                    </div>
                  )}
                </a>
              ))
            : displayRepos?.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col gap-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {repo.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="font-mono text-xs text-muted-foreground">
                        {repo.stargazers_count}
                      </span>
                    </div>
                  </div>
                  {repo.description && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {repo.description}
                    </p>
                  )}
                  {repo.language && (
                    <div className="flex items-center gap-1.5">
                      {getDevIconUrl(repo.language) ? (
                        <Image
                          src={getDevIconUrl(repo.language)!}
                          alt={repo.language}
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      ) : (
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              stats.topLanguages.find(
                                (l) => l.language === repo.language,
                              )?.color || "hsl(var(--primary))",
                          }}
                        />
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {repo.language}
                      </span>
                    </div>
                  )}
                </a>
              ))}
        </div>
      )}

      <a
        href={`https://github.com/${stats.user.login}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        Ver en GitHub
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
