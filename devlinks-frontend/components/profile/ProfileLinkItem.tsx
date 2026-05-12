"use client";

import { useCallback } from "react";
import { Link as LinkIcon, Globe } from "lucide-react";
import type { PublicProfile } from "@/types";

interface ProfileLinkItemProps {
  link: PublicProfile["links"][number];
  accentColor: string;
}

function getIconType(iconName: string | null): string {
  if (!iconName) return "link";
  const normalized = iconName.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("github")) return "github";
  if (normalized.includes("twitter") || normalized.includes("x")) return "twitter";
  if (normalized.includes("linkedin")) return "linkedin";
  if (normalized.includes("web") || normalized.includes("site")) return "web";
  return "link";
}

export function ProfileLinkItem({ link, accentColor }: ProfileLinkItemProps) {
  const iconType = getIconType(link.icon);

  const handleClick = useCallback(() => {
    if (link.id) {
      fetch(`/links/${link.id}/click`, { method: "POST" }).catch(() => {});
    }
  }, [link.id]);

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition-all duration-200 hover:border-white/20 hover:bg-white/10 active:scale-[0.98] min-h-[44px]"
    >
      <span
        className="flex size-5 items-center justify-center rounded-md transition-colors duration-200"
        style={{ color: accentColor }}
      >
        {iconType === "github" && <Globe className="size-5" />}
        {iconType === "twitter" && <Globe className="size-5" />}
        {iconType === "linkedin" && <Globe className="size-5" />}
        {iconType === "web" && <Globe className="size-5" />}
        {iconType === "link" && <LinkIcon className="size-5" />}
      </span>
      <span className="flex-1 truncate text-sm font-medium text-white/90 group-hover:text-white">
        {link.title}
      </span>
      <span className="text-xs text-white/40 transition-transform duration-200 group-hover:translate-x-0.5">
        ↗
      </span>
    </a>
  );
}