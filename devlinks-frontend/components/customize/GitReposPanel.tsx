"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Star,
  AlertCircle,
  Search,
  X,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { githubApi, getDevIconUrl } from "@/lib/api/github.api";
import { userApi } from "@/lib/api/user.api";
import { useNotifications } from "@/hooks/use-notifications";
import type { GithubRepo, Project, PinnedRepoPayload } from "@/types";
import Image from "next/image";

const MAX_PINNED = 6;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function RepoLanguageIcon({ language }: { language: string | null }) {
  const iconUrl = language ? getDevIconUrl(language) : null;
  if (iconUrl) {
    return (
      <Image
        src={iconUrl}
        alt={language ?? ""}
        width={16}
        height={16}
        className="size-4 shrink-0"
        unoptimized
      />
    );
  }
  return <div className="size-4 shrink-0 rounded-sm bg-muted" />;
}

interface GitReposPanelProps {
  githubUsername: string | null | undefined;
}

export function GitReposPanel({ githubUsername }: GitReposPanelProps) {
  const { notifySuccess, notifyError } = useNotifications();
  const [allRepos, setAllRepos] = useState<GithubRepo[]>([]);
  const [saved, setSaved] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!githubUsername) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [repos, projects] = await Promise.all([
          githubApi.getAllRepos(githubUsername),
          userApi.getMyProjects(),
        ]);
        if (!cancelled) {
          setAllRepos(repos);
          setSaved(projects);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar repositorios",
          );
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

  const isSelected = useCallback(
    (repo: GithubRepo) => saved.some((p) => p.url === repo.html_url),
    [saved],
  );

  const toggleRepo = useCallback(
    async (repo: GithubRepo) => {
      if (saving) return;

      const alreadySelected = isSelected(repo);
      const previousSaved = saved;

      let nextSaved: Project[];
      if (alreadySelected) {
        nextSaved = saved.filter((p) => p.url !== repo.html_url);
      } else {
        if (saved.length >= MAX_PINNED) {
          notifyError(`Máximo ${MAX_PINNED} repositorios`);
          return;
        }
        const newProject: Project = {
          id: `temp-${repo.id}`,
          title: repo.name,
          description: repo.description,
          url: repo.html_url,
          githubRepo: repo.html_url.replace("https://github.com/", ""),
          stars: repo.stargazers_count,
          language: repo.language,
          pinned: true,
          displayOrder: saved.length,
        };
        nextSaved = [...saved, newProject];
      }

      setSaved(nextSaved);
      setSaving(true);

      const payload: PinnedRepoPayload[] = nextSaved.map((p) => ({
        name: p.title,
        description: p.description,
        url: p.url ?? "",
        githubRepo: p.githubRepo,
        stars: p.stars,
        language: p.language,
      }));

      try {
        await userApi.setPinnedRepos(payload);
        notifySuccess(
          alreadySelected ? "Repositorio eliminado" : "Repositorio guardado",
        );
      } catch (err) {
        setSaved(previousSaved);
        notifyError(
          err instanceof Error ? err.message : "Error al guardar repositorios",
        );
      } finally {
        setSaving(false);
      }
    },
    [saved, saving, isSelected, notifySuccess, notifyError],
  );

  const removeSaved = useCallback(
    async (project: Project) => {
      if (saving) return;

      const previousSaved = saved;
      const nextSaved = saved.filter((p) => p.id !== project.id);
      setSaved(nextSaved);
      setSaving(true);

      const payload: PinnedRepoPayload[] = nextSaved.map((p) => ({
        name: p.title,
        description: p.description,
        url: p.url ?? "",
        githubRepo: p.githubRepo,
        stars: p.stars,
        language: p.language,
      }));

      try {
        await userApi.setPinnedRepos(payload);
        notifySuccess("Repositorio eliminado");
      } catch (err) {
        setSaved(previousSaved);
        notifyError(
          err instanceof Error ? err.message : "Error al guardar repositorios",
        );
      } finally {
        setSaving(false);
      }
    },
    [saved, saving, notifySuccess, notifyError],
  );

  const filtered = allRepos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  if (!githubUsername) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <AlertCircle className="size-8 text-muted-foreground/60" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Sin conexión a GitHub
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">
            Conecta tu cuenta de GitHub en ajustes para ver tus repositorios.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <div className="size-5 animate-spin rounded-full border-2 border-border border-t-transparent" />
        <p className="text-[11px] text-muted-foreground">
          Cargando repositorios...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <AlertCircle className="size-8 text-destructive/70" />
        <div>
          <p className="text-sm font-medium text-destructive">
            Error al cargar
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground/70">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>
          Repos seleccionados ({saved.length}/{MAX_PINNED})
        </SectionLabel>
        {saved.length === 0 ? (
          <p className="py-2 text-center text-[11px] text-muted-foreground">
            Ningún repositorio seleccionado
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {saved.map((project) => (
              <div
                key={project.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[11px] text-foreground"
              >
                <RepoLanguageIcon language={project.language} />
                <span className="max-w-[120px] truncate">{project.title}</span>
                <button
                  type="button"
                  onClick={() => removeSaved(project)}
                  disabled={saving}
                  className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                  aria-label={`Eliminar ${project.title}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar repositorio..."
          className="pl-7 text-xs"
        />
      </div>

      <div>
        <SectionLabel>Todos los repositorios</SectionLabel>
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="py-2 text-center text-[11px] text-muted-foreground">
              Sin resultados
            </p>
          )}
          {filtered.map((repo) => {
            const selected = isSelected(repo);
            const atLimit = saved.length >= MAX_PINNED && !selected;
            return (
              <div
                key={repo.id}
                className="group flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 p-3 transition-all duration-150 hover:border-border hover:bg-muted/40"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <RepoLanguageIcon language={repo.language} />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {repo.name}
                    </span>
                    {repo.description && (
                      <p className="line-clamp-1 text-[10px] text-muted-foreground">
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground/80">
                      <span className="flex items-center gap-0.5">
                        <Star className="size-2.5" />
                        {repo.stargazers_count}
                      </span>
                      {repo.language && <span>{repo.language}</span>}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleRepo(repo)}
                  disabled={saving || atLimit}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-150 disabled:opacity-40"
                  style={
                    selected
                      ? {
                          borderColor: "hsl(var(--primary))",
                          background: "hsl(var(--primary))",
                          color: "hsl(var(--primary-foreground))",
                        }
                      : {
                          borderColor: "rgba(255,255,255,0.12)",
                          background: "transparent",
                          color: "var(--muted-foreground)",
                        }
                  }
                  aria-label={
                    selected ? "Desfijar repositorio" : "Fijar repositorio"
                  }
                >
                  {saving ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : selected ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
