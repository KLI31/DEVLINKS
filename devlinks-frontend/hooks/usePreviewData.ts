"use client";

import { useEffect, useState } from "react";
import { linksApi } from "@/lib/api/links.api";
import { userApi } from "@/lib/api/user.api";
import { githubApi } from "@/lib/api/github.api";
import type { AuthUser } from "@/types/auth";
import type { LinkItem, Project, GithubStats } from "@/types";

interface PreviewData {
  links: LinkItem[];
  projects: Project[];
  githubStats: GithubStats | null;
  isLoading: boolean;
}

/**
 * Carga el contenido REAL del usuario (links activos, proyectos y stats de
 * GitHub) para alimentar el preview de la página de customización, de modo que
 * los cambios de estilo se vean sobre el perfil real y no sobre datos mock.
 */
export function usePreviewData(user: AuthUser | null): PreviewData {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [githubStats, setGithubStats] = useState<GithubStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const githubUsername = user?.githubUsername ?? null;

  useEffect(() => {
    let active = true;

    Promise.all([
      linksApi.getAll().catch(() => [] as LinkItem[]),
      userApi.getMyProjects().catch(() => [] as Project[]),
      githubUsername
        ? githubApi.getStats(githubUsername).catch(() => null)
        : Promise.resolve(null),
    ]).then(([linksRes, projectsRes, statsRes]) => {
      if (!active) return;
      setLinks(linksRes.filter((l) => l.isActive));
      setProjects(projectsRes);
      setGithubStats(statsRes);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [githubUsername]);

  return { links, projects, githubStats, isLoading };
}
