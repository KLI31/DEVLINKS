import type { GithubStats, Project, PublicProfile } from "@/types";

const DAY_MS = 86_400_000;
const START = Date.UTC(2026, 2, 30);

// Fechas a mediodía sin zona horaria: getDay() da el mismo día en server y client.
const contributions: GithubStats["contributions"] = Array.from(
  { length: 28 * 7 },
  (_, i) => {
    const level = ((i * 7 + (i % 5) * 3) % 9 > 3 ? (i * 13) % 5 : 0) as
      0 | 1 | 2 | 3 | 4;
    return {
      date: `${new Date(START + i * DAY_MS).toISOString().slice(0, 10)}T12:00:00`,
      count: level * 3,
      level,
    };
  },
);

const projects: Project[] = [
  {
    id: "demo-p1",
    title: "ui-kit",
    description: "Componentes accesibles para React y Tailwind",
    url: "https://github.com/leomarin/ui-kit",
    githubRepo: "leomarin/ui-kit",
    stars: 1240,
    language: "TypeScript",
    pinned: true,
    displayOrder: 0,
  },
  {
    id: "demo-p2",
    title: "react-hooks",
    description: "Hooks pequeños y sin dependencias",
    url: "https://github.com/leomarin/react-hooks",
    githubRepo: "leomarin/react-hooks",
    stars: 212,
    language: "TypeScript",
    pinned: true,
    displayOrder: 1,
  },
];

export const DEMO_PROFILE: PublicProfile = {
  id: "demo",
  username: "leomarin",
  displayName: "Leo Marín",
  bio: "Frontend developer · Open source · Enseño React en español",
  location: "Bogotá, Colombia",
  avatarUrl: null,
  githubUsername: "leomarin",
  theme: "default",
  accentColor: "#0d9488",
  buttonStyle: "rounded",
  fontFamily: "jetbrains-mono",
  bgType: "solid",
  bgColor: "#0f172a",
  profileLayout: "classic",
  coverImageUrl: "",
  layout: "classic",
  title: null,
  titleStyle: "default",
  titleColor: "#f8fafc",
  pageTextColor: "#f8fafc",
  buttonVariant: "solid",
  buttonRadius: 12,
  buttonShadow: "none",
  buttonColor: "#0d9488",
  buttonTextColor: "#f8fafc",
  altTitleFont: false,
  titleFont: "jetbrains-mono",
  stickers: null,
  links: [
    { title: "Mi sitio", url: "https://leo.dev" },
    { title: "Curso de React", url: "https://leo.dev/react" },
    { title: "Newsletter", url: "https://leo.dev/news" },
  ].map((link, i) => ({
    ...link,
    id: `demo-l${i}`,
    icon: null,
    previewImage: null,
    isPrimary: false,
    displayOrder: i,
    layout: "classic" as const,
  })),
  projects,
};

export const DEMO_PROJECTS = projects;

export const DEMO_GITHUB_STATS: GithubStats = {
  user: {
    login: "leomarin",
    name: "Leo Marín",
    avatar_url: "",
    public_repos: 48,
    followers: 812,
    following: 104,
    bio: null,
  },
  topRepos: projects.map((p, i) => ({
    id: i,
    name: p.title,
    description: p.description,
    html_url: p.url ?? "",
    stargazers_count: p.stars,
    forks_count: 0,
    language: p.language,
    pushed_at: "2026-10-15T12:00:00Z",
    updated_at: "2026-10-15T12:00:00Z",
  })),
  topLanguages: [
    { language: "TypeScript", count: 30, pct: 70, color: "#3178c6" },
    { language: "CSS", count: 8, pct: 20, color: "#663399" },
    { language: "Shell", count: 4, pct: 10, color: "#89e051" },
  ],
  totalRepos: 48,
  followers: 812,
  contributions,
  totalContributions: 1284,
  fetchedAt: 0,
};
