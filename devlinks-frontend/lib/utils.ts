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
