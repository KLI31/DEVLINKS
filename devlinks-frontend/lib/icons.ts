export function getIconUrl(name: string): string {
  return `https://cdn.simpleicons.org/${name}`;
}

export type IconName =
  | "github"
  | "google"
  | "twitter"
  | "linkedin"
  | "instagram"
  | "youtube"
  | "facebook"
  | "discord";

export const iconMap: Record<IconName, string> = {
  github: "github",
  google: "google",
  twitter: "x",
  linkedin: "linkedin",
  instagram: "instagram",
  youtube: "youtube",
  facebook: "facebook",
  discord: "discord",
};

export function getSocialIconUrl(icon: IconName): string {
  return getIconUrl(iconMap[icon]);
}

export const PLATFORM_ICONS = [
  { slug: "github", label: "GitHub" },
  { slug: "youtube", label: "YouTube" },
  { slug: "instagram", label: "Instagram" },
  { slug: "x", label: "X / Twitter" },
  { slug: "linkedin", label: "LinkedIn" },
  { slug: "tiktok", label: "TikTok" },
  { slug: "twitch", label: "Twitch" },
  { slug: "discord", label: "Discord" },
  { slug: "spotify", label: "Spotify" },
  { slug: "facebook", label: "Facebook" },
  { slug: "reddit", label: "Reddit" },
  { slug: "medium", label: "Medium" },
  { slug: "devdotto", label: "Dev.to" },
  { slug: "hashnode", label: "Hashnode" },
  { slug: "dribbble", label: "Dribbble" },
  { slug: "figma", label: "Figma" },
  { slug: "notion", label: "Notion" },
  { slug: "codepen", label: "CodePen" },
  { slug: "stackoverflow", label: "Stack Overflow" },
  { slug: "npm", label: "npm" },
  { slug: "vercel", label: "Vercel" },
  { slug: "netlify", label: "Netlify" },
  { slug: "gitlab", label: "GitLab" },
  { slug: "docker", label: "Docker" },
  { slug: "telegram", label: "Telegram" },
  { slug: "whatsapp", label: "WhatsApp" },
  { slug: "bluesky", label: "Bluesky" },
  { slug: "patreon", label: "Patreon" },
  { slug: "kofi", label: "Ko-fi" },
  { slug: "buymeacoffee", label: "Buy Me a Coffee" },
  { slug: "gumroad", label: "Gumroad" },
  { slug: "producthunt", label: "Product Hunt" },
  { slug: "behance", label: "Behance" },
  { slug: "substack", label: "Substack" },
  { slug: "threads", label: "Threads" },
  { slug: "mastodon", label: "Mastodon" },
  { slug: "bitbucket", label: "Bitbucket" },
  { slug: "snapchat", label: "Snapchat" },
  { slug: "pinterest", label: "Pinterest" },
  { slug: "soundcloud", label: "SoundCloud" },
  { slug: "bandcamp", label: "Bandcamp" },
  { slug: "etsy", label: "Etsy" },
  { slug: "paypal", label: "PayPal" },
  { slug: "applemusic", label: "Apple Music" },
] as const;

export type IconSlug = (typeof PLATFORM_ICONS)[number]["slug"];

export const SOCIAL_SLUGS = new Set([
  "x", "twitter", "instagram", "tiktok", "facebook", "threads",
  "bluesky", "mastodon", "snapchat", "reddit", "pinterest",
  "youtube", "twitch", "spotify", "soundcloud",
  "linkedin", "discord", "telegram", "whatsapp",
]);

export function isSocialIcon(icon: string | null | undefined): boolean {
  if (!icon) return false;
  return SOCIAL_SLUGS.has(icon.toLowerCase());
}

const ICONIFY_OVERRIDES: Record<string, string> = {
  linkedin: "mdi:linkedin",
};

export function iconUrl(slug: string, color?: string): string {
  const hex = color?.replace(/^#/, "");
  const iconify = ICONIFY_OVERRIDES[slug];
  if (iconify) {
    return hex
      ? `https://api.iconify.design/${iconify}.svg?color=%23${hex}`
      : `https://api.iconify.design/${iconify}.svg`;
  }
  return hex
    ? `https://cdn.simpleicons.org/${slug}/${hex}`
    : `https://cdn.simpleicons.org/${slug}`;
}
