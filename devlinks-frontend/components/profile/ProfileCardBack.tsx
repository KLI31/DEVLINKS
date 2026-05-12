"use client";

import type { ReactNode } from "react";
import { Star, ExternalLink } from "lucide-react";
import { getDevIconUrl } from "@/lib/api/github.api";
import type { Project } from "@/types";
import Image from "next/image";

interface ProfileCardBackProps {
  accentColor: string;
  children?: ReactNode;
  projects?: Project[];
}

const MOCK_STATS = {
  repos: 42,
  commits: 1200,
  followers: 380,
  following: 91,
};

const MOCK_LANGUAGES = [
  { name: "TypeScript", pct: 68 },
  { name: "Rust", pct: 22 },
  { name: "Go", pct: 10 },
];

export function ProfileCardBack({
  accentColor,
  children,
  projects = [],
}: ProfileCardBackProps) {
  return (
    <div
      className="relative flex min-h-full flex-col rounded-[30px] border border-white/10 p-4 font-mono text-sm"
      style={{ background: "#0d1117" }}
    >
      {children}

      <div
        className="flex items-center justify-between rounded-md px-3 py-2"
        style={{ background: "#161b22" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white/40">&gt; dev_info.json</span>
        </div>
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3 px-1">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[#39d353]">●</span>
            <span className="text-white/60">repos</span>
            <span className="ml-auto text-white/90">{MOCK_STATS.repos}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#39d353]">●</span>
            <span className="text-white/60">commits</span>
            <span className="ml-auto text-white/90">
              {MOCK_STATS.commits.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#39d353]">●</span>
            <span className="text-white/60">followers</span>
            <span className="ml-auto text-white/90">
              {MOCK_STATS.followers}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#39d353]">●</span>
            <span className="text-white/60">siguiendo</span>
            <span className="ml-auto text-white/90">
              {MOCK_STATS.following}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <span className="text-white/40">top langs:</span>
          <div className="mt-2 space-y-2">
            {MOCK_LANGUAGES.map((lang) => (
              <div key={lang.name} className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${lang.pct}%`,
                      backgroundColor: accentColor,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <span className="w-16 text-right text-white/60">
                  {lang.name}
                </span>
                <span className="w-8 text-right text-white/40">
                  {lang.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <span className="text-white/40">pinned repos:</span>
          {projects.length === 0 ? (
            <p className="mt-2 text-[11px] text-white/30">
              Sin repositorios destacados
            </p>
          ) : (
            <div className="mt-2 space-y-2">
              {projects.slice(0, 3).map((project) => {
                const iconUrl = project.language
                  ? getDevIconUrl(project.language)
                  : null;
                return (
                  <a
                    key={project.id}
                    href={project.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-white/5"
                  >
                    {iconUrl ? (
                      <Image
                        src={iconUrl}
                        alt={project.language ?? ""}
                        width={14}
                        height={14}
                        unoptimized
                        className="size-3.5 shrink-0"
                      />
                    ) : (
                      <div className="size-3.5 shrink-0 rounded-sm bg-white/10" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-[11px] text-white/80">
                      {project.title}
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] text-white/40">
                      <Star className="size-2.5" />
                      {project.stars}
                    </span>
                    <ExternalLink className="size-2.5 shrink-0 text-white/20" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
