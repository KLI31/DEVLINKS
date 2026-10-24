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

function makeProjects(
  user: string,
  titles: [string, string],
  stars: [number, number],
  language: string,
): Project[] {
  return titles.map((title, i) => ({
    id: `${user}-p${i}`,
    title,
    description:
      i === 0
        ? "Componentes accesibles y sin dependencias"
        : "Herramientas pequeñas para el día a día",
    url: `https://github.com/${user}/${title}`,
    githubRepo: `${user}/${title}`,
    stars: stars[i],
    language,
    pinned: true,
    displayOrder: i,
  }));
}

function makeProfile(
  overrides: Partial<PublicProfile> &
    Pick<PublicProfile, "username" | "displayName" | "bio" | "location">,
  linkTitles: string[],
  projectList: Project[],
): PublicProfile {
  return {
    id: `demo-${overrides.username}`,
    avatarUrl: null,
    githubUsername: overrides.username,
    theme: "default",
    accentColor: "#0d9488",
    buttonStyle: "rounded",
    fontFamily: "jetbrains-mono",
    bgType: "solid",
    bgColor: "#0f172a",
    profileLayout: "hero",
    coverImageUrl: "",
    layout: "hero",
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
    ...overrides,
    links: linkTitles.map((title, i) => ({
      id: `demo-${overrides.username}-l${i}`,
      title,
      url: `https://${overrides.username}.dev/${i}`,
      icon: null,
      previewImage: null,
      isPrimary: false,
      displayOrder: i,
      layout: "classic" as const,
    })),
    projects: projectList,
  };
}

function makeStats(
  profile: PublicProfile,
  repos: number,
  followers: number,
  following: number,
  langs: GithubStats["topLanguages"],
  offset: number,
): GithubStats {
  return {
    user: {
      login: profile.username,
      name: profile.displayName,
      avatar_url: "",
      public_repos: repos,
      followers,
      following,
      bio: null,
    },
    topRepos: profile.projects.map((p, i) => ({
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
    topLanguages: langs,
    totalRepos: repos,
    followers,
    contributions: contributions.map((c, i) => {
      const level = ((i * 5 + offset) % 7 > 2 ? (i * 11 + offset) % 5 : 0) as
        0 | 1 | 2 | 3 | 4;
      return { ...c, count: level * 3, level };
    }),
    totalContributions: 900 + offset * 120,
    fetchedAt: Date.now() - 2 * 3_600_000,
  };
}

const leoProjects = makeProjects(
  "leomarin",
  ["ui-kit", "react-hooks"],
  [1240, 212],
  "TypeScript",
);
const anaProjects = makeProjects(
  "anarivera",
  ["api-starter", "go-queue"],
  [842, 301],
  "Go",
);
const sofiaProjects = makeProjects(
  "sofiacruz",
  ["rustlings-es", "cli-tools"],
  [623, 154],
  "Rust",
);

export const DEMO_PROFILE = makeProfile(
  {
    username: "leomarin",
    displayName: "Leo Marín",
    bio: "Frontend developer · Open source · Enseño React en español",
    location: "Bogotá, Colombia",
    avatarUrl: "/hero/pin-5.jpg",
    coverImageUrl: "/hero/pin-4.jpg",
  },
  ["Mi sitio", "Curso de React", "Newsletter"],
  leoProjects,
);

const ANA = makeProfile(
  {
    username: "anarivera",
    displayName: "Ana Rivera",
    bio: "Backend engineer · Go y PostgreSQL · Café y APIs",
    location: "Ciudad de México",
    avatarUrl: "/hero/pin-2.jpg",
    coverImageUrl: "/hero/pin-3.jpg",
    bgColor: "#f8fafc",
    accentColor: "#0d9488",
    titleColor: "#0f172a",
    pageTextColor: "#0f172a",
    buttonTextColor: "#ffffff",
  },
  ["Portafolio", "Blog", "Charlas"],
  anaProjects,
);

const SOFIA = makeProfile(
  {
    username: "sofiacruz",
    displayName: "Sofía Cruz",
    bio: "DevRel · Speaker · Rust para humanos",
    location: "Madrid, España",
    avatarUrl: "/hero/pin-1.jpg", coverImageUrl: "/hero/pin-6.jpg",
    bgColor: "#1e1b4b",
    accentColor: "#8b5cf6",
    buttonColor: "#8b5cf6",
  },
  ["Próximas charlas", "Newsletter", "YouTube"],
  sofiaProjects,
);

export const DEMO_PROJECTS = leoProjects;

export const DEMO_GITHUB_STATS = makeStats(
  DEMO_PROFILE,
  48,
  812,
  104,
  [
    { language: "TypeScript", count: 30, pct: 70, color: "#3178c6" },
    { language: "CSS", count: 8, pct: 20, color: "#663399" },
    { language: "Shell", count: 4, pct: 10, color: "#89e051" },
  ],
  0,
);

export const DEMO_SIDE_PROFILES = [
  {
    profile: ANA,
    projects: anaProjects,
    stats: makeStats(
      ANA,
      64,
      1530,
      210,
      [
        { language: "Go", count: 24, pct: 60, color: "#00ADD8" },
        { language: "TypeScript", count: 10, pct: 25, color: "#3178c6" },
        { language: "Shell", count: 6, pct: 15, color: "#89e051" },
      ],
      2,
    ),
  },
  {
    profile: SOFIA,
    projects: sofiaProjects,
    stats: makeStats(
      SOFIA,
      37,
      2410,
      96,
      [
        { language: "Rust", count: 20, pct: 55, color: "#dea584" },
        { language: "Python", count: 10, pct: 30, color: "#3776AB" },
        { language: "TypeScript", count: 5, pct: 15, color: "#3178c6" },
      ],
      4,
    ),
  },
] as const;
