import { apiService } from "./api-service";
import type { GithubStats, GithubRepo } from "@/types";

export const DEVICON_SLUGS: Record<string, string> = {
  TypeScript: "typescript",
  JavaScript: "javascript",
  Python: "python",
  Rust: "rust",
  Go: "go",
  Java: "java",
  "C#": "csharp",
  "C++": "cplusplus",
  C: "c",
  Ruby: "ruby",
  PHP: "php",
  Swift: "swift",
  Kotlin: "kotlin",
  Dart: "dart",
  Vue: "vuejs",
  HTML: "html5",
  CSS: "css3",
  Shell: "bash",
  Scala: "scala",
  Haskell: "haskell",
  Astro: "astro",
  React: "react",
  Nextjs: "nextjs",
  Tailwind: "tailwindcss",
  Shadcn: "shadcn",
};

export function getDevIconUrl(language: string): string | null {
  const slug = DEVICON_SLUGS[language];
  if (!slug) return null;
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`;
}

export const githubApi = {
  getStats: (username: string) =>
    apiService.get<GithubStats>(
      `/github/stats?username=${encodeURIComponent(username)}`,
    ),

  getAllRepos: (username: string) =>
    apiService.get<GithubRepo[]>(
      `/github/repos?username=${encodeURIComponent(username)}`,
    ),

  disconnect: (username: string) =>
    apiService.post<void>("/github/disconnect", { username }),
};
