"use client";

import Image from "next/image";
import Link from "next/link";
import { Link2, ArrowRight } from "lucide-react";
import type { LinkItem } from "@/types";
import type { LinkStat } from "@/types/analytics";
import { getIconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Panel } from "./Panel";

const MAX_ROWS = 6;

interface RecentLinksCardProps {
  links: LinkItem[];
  stats: LinkStat[];
}

function getLinkIconUrl(icon: string | null): string | null {
  if (!icon) return null;
  try {
    return getIconUrl(icon as Parameters<typeof getIconUrl>[0]);
  } catch {
    return null;
  }
}

export function RecentLinksCard({ links, stats }: RecentLinksCardProps) {
  const clicksById = new Map(stats.map((s) => [s.id, s.clicks]));
  const rows = links.slice(0, MAX_ROWS);

  return (
    <Panel className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">Mis links</h2>
          <span className="rounded-md bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            {links.length} / 20
          </span>
        </div>
        <Link
          href="/dashboard/links"
          className="inline-flex h-11 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          Ver más
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aún no tienes links. Agrega el primero.
          </p>
          <Link
            href="/dashboard/links"
            className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-muted hover:text-foreground"
          >
            Agregar link
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Link</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">URL</th>
                <th className="px-4 py-3 text-right font-medium">Clics</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((link) => {
                const iconUrl = getLinkIconUrl(link.icon);
                return (
                  <tr key={link.id} className="transition-colors duration-150 hover:bg-muted/30">
                    <td className="max-w-[12rem] px-4 py-3">
                      <div className="flex items-center gap-3">
                        {iconUrl ? (
                          <Image
                            src={iconUrl}
                            alt=""
                            width={20}
                            height={20}
                            loading="lazy"
                            unoptimized
                            className="shrink-0 rounded-sm object-contain"
                          />
                        ) : (
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                            <Link2 className="size-3 text-primary" />
                          </div>
                        )}
                        <span className="truncate font-medium text-foreground">
                          {link.title}
                        </span>
                      </div>
                    </td>
                    <td className="hidden max-w-[16rem] truncate px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                      {link.url}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                      {clicksById.get(link.id) ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                          link.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            link.isActive ? "bg-emerald-500" : "bg-muted-foreground",
                          )}
                        />
                        {link.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
