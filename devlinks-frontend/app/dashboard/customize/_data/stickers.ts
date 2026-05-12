export type Sticker = {
  slug: string;
  label: string;
  brandColor: string;
};

export const PROGRAMMING_STICKERS: Sticker[] = [
  { slug: "react",       label: "React",       brandColor: "#61DAFB" },
  { slug: "typescript",  label: "TypeScript",   brandColor: "#3178C6" },
  { slug: "nextdotjs",   label: "Next.js",      brandColor: "#D0D0D0" },
  { slug: "vuedotjs",    label: "Vue",          brandColor: "#4FC08D" },
  { slug: "svelte",      label: "Svelte",       brandColor: "#FF3E00" },
  { slug: "nodedotjs",   label: "Node.js",      brandColor: "#5FA04E" },
  { slug: "python",      label: "Python",       brandColor: "#3776AB" },
  { slug: "rust",        label: "Rust",         brandColor: "#CE422B" },
  { slug: "go",          label: "Go",           brandColor: "#00ACD7" },
  { slug: "docker",      label: "Docker",       brandColor: "#2496ED" },
  { slug: "postgresql",  label: "PostgreSQL",   brandColor: "#4169E1" },
  { slug: "redis",       label: "Redis",        brandColor: "#FF4438" },
  { slug: "graphql",     label: "GraphQL",      brandColor: "#E10098" },
  { slug: "tailwindcss", label: "Tailwind",     brandColor: "#06B6D4" },
  { slug: "prisma",      label: "Prisma",       brandColor: "#5A67D8" },
  { slug: "git",         label: "Git",          brandColor: "#F05032" },
  { slug: "neovim",      label: "Neovim",       brandColor: "#57A143" },
  { slug: "linux",       label: "Linux",        brandColor: "#FCC624" },
  { slug: "kubernetes",  label: "Kubernetes",   brandColor: "#326CE5" },
  { slug: "angular",     label: "Angular",      brandColor: "#DD0031" },
  { slug: "mongodb",     label: "MongoDB",      brandColor: "#47A248" },
  { slug: "supabase",    label: "Supabase",     brandColor: "#3ECF8E" },
  { slug: "astro",       label: "Astro",        brandColor: "#FF5D01" },
  { slug: "vercel",      label: "Vercel",       brandColor: "#CCCCCC" },
];
