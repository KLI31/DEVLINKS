"use client";

import Image from "next/image";
import Link from "next/link";
import { Link2, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { LinkItem } from "@/types";
import { tooltipAnimation } from "@/lib/animations";
import { getIconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";

const MotionLink = motion.create(Link);

interface RecentLinksCardProps {
  links: LinkItem[];
}

function getLinkIconUrl(icon: string | null): string | null {
  if (!icon) return null;
  try {
    return getIconUrl(icon as Parameters<typeof getIconUrl>[0]);
  } catch {
    return null;
  }
}

export function RecentLinksCard({ links }: RecentLinksCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const activeLinks = links.filter((l) => l.isActive);

  const totalLinks = links.length;

  const rowHoverMotion = prefersReducedMotion
    ? undefined
    : { x: 4, y: -1, rotate: 0.4 };

  const footerArrowVariants = {
    rest: { x: 0 },
    hover: prefersReducedMotion ? { x: 0 } : { x: 5 },
  } as const;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card px-5 py-4 sm:px-6 flex flex-col gap-4",
        "transition-shadow duration-300 hover:shadow-hover",
      )}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Mis links</h2>
        <span className="font-mono text-xs text-muted-foreground">
          {totalLinks} / 20
        </span>
      </div>

      {activeLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Link2 className="h-6 w-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Aún no tienes links. Agrega el primero.
          </p>
          <Link
            href="/dashboard/links"
            className="inline-flex h-8 items-center rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
          >
            Agregar link
          </Link>
        </div>
      ) : (
        <div className="flex flex-col">
          {activeLinks.map((link) => {
            const iconUrl = getLinkIconUrl(link.icon);
            return (
              <motion.div
                key={link.id}
                className={cn(
                  "flex items-center gap-3.5 py-2.5 px-2 sm:px-3 rounded-lg border-b border-border/50 last:border-0",
                  "hover:bg-muted/45",
                )}
                whileHover={rowHoverMotion}
                transition={tooltipAnimation.transition}
              >
                {iconUrl ? (
                  <Image
                    src={iconUrl}
                    alt={link.title}
                    width={20}
                    height={20}
                    loading="lazy"
                    unoptimized
                    className="shrink-0 rounded-sm object-contain"
                  />
                ) : (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-primary/10">
                    <Link2 className="h-3 w-3 text-primary" />
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">
                    {link.title}
                  </span>
                  <span className="truncate font-mono text-xs text-muted-foreground max-w-[10rem]">
                    {link.url}
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                    link.isActive
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-muted text-muted-foreground opacity-60",
                  )}
                >
                  {link.isActive ? "activo" : "inactivo"}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      <MotionLink
        href="/dashboard/links"
        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        initial="rest"
        whileHover={prefersReducedMotion ? undefined : "hover"}
        variants={{
          rest: {},
          hover: {},
        }}
      >
        Gestionar todos
        <motion.span
          className="inline-flex"
          variants={footerArrowVariants}
          transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
        >
          <ArrowRight className="h-3 w-3" />
        </motion.span>
      </MotionLink>
    </div>
  );
}
