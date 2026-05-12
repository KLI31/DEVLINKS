"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link2, ChevronDown } from "lucide-react";
import type { LinkStat } from "@/types/analytics";
import Image from "next/image";

interface LinksProgressListProps {
  links: LinkStat[];
  accentColor: string;
}

function LinkIcon({ icon }: { icon: string | null }) {
  if (!icon)
    return <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />;
  return (
    <Image
      src={icon}
      width={16}
      height={16}
      alt={icon}
      unoptimized
      className="shrink-0 object-contain"
    />
  );
}

export function LinksProgressList({
  links,
  accentColor,
}: LinksProgressListProps) {
  const isReducedMotion = useReducedMotion();
  const [showAll, setShowAll] = useState(false);

  const sortedLinks = [...links].sort((a, b) => b.clicks - a.clicks);
  const visibleLinks = showAll ? sortedLinks : sortedLinks.slice(0, 10);
  const hasMore = sortedLinks.length > 10;
  const maxClicks = sortedLinks[0]?.clicks ?? 1;

  if (links.length === 0) {
    return (
      <div className="flex w-full flex-col rounded-xl border border-border/70 bg-card p-5 shadow-(--shadow-card)">
        <h3 className="font-medium">Rendimiento por link</h3>
        <div className="flex flex-1 items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            Ningún link tiene clics aún
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-border/70 bg-card p-5 shadow-(--shadow-card)">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium">Rendimiento por link</h3>
        <span className="text-xs text-muted-foreground">
          {sortedLinks.length} links
        </span>
      </div>

      <div className="flex flex-col divide-y divide-border/50">
        {visibleLinks.map((link, index) => {
          const pct = maxClicks > 0 ? (link.clicks / maxClicks) * 100 : 0;
          return (
            <div
              key={link.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              {/* Rank */}
              <span className="w-5 shrink-0 text-center font-mono text-xs text-muted-foreground/60">
                {index + 1}
              </span>

              {/* Icon */}
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <LinkIcon icon={link.icon} />
              </div>

              {/* Title + bar */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <span className="block truncate text-sm font-medium text-foreground">
                  {link.title}
                </span>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: accentColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={
                      isReducedMotion
                        ? { duration: 0 }
                        : {
                            duration: 0.5,
                            ease: "easeOut",
                            delay: index * 0.04,
                          }
                    }
                  />
                </div>
              </div>

              {/* Clicks badge */}
              <div className="shrink-0 text-right">
                <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                  {link.clicks.toLocaleString("es-ES")}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  clics
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border/50 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <span>
            {showAll ? "Ver menos" : `Ver todos (${sortedLinks.length})`}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
