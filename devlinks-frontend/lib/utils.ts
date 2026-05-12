import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getPublicSiteOrigin(): { protocol: string; host: string } {
  const isProd = process.env.NEXT_PUBLIC_ENV === "production";
  const host = isProd ? "devlinks.nova11labs.dev" : "localhost:3000";
  const protocol = isProd ? "https" : "http";
  return { protocol, host };
}

export function getPublicProfileUrlPrefix(): string {
  const { protocol, host } = getPublicSiteOrigin();
  return `${protocol}://${host}/u/`;
}

export const getProfileUrl = (username: string) => {
  return `${getPublicProfileUrlPrefix()}${username}`;
};
