import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getPublicSiteOrigin(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_ENV === "production"
      ? "https://devlinks.lramdev.com"
      : "http://localhost:3000")
  );
}

export function getPublicProfileUrlPrefix(): string {
  return `${getPublicSiteOrigin()}/u/`;
}

export const getProfileUrl = (username: string) => {
  return `${getPublicProfileUrlPrefix()}${username}`;
};

export function perceivedLuminance(hex: string): number {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
