"use client";

import Image from "next/image";
import { Link as LinkIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLinksStore } from "@/store/links-store";
import { iconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function LinksPreview() {
  const { user } = useAuthStore();
  const { links } = useLinksStore();

  const activeLinks = links.filter((l) => l.isActive);

  return (
    <div className="flex h-full flex-col items-center gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-col items-center gap-3">
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-border">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              width={80}
              height={80}
              className="size-full object-cover"
            />
          ) : (
            <span className="text-xl font-medium text-muted-foreground">
              {getInitials(user?.displayName ?? "?")}
            </span>
          )}
        </div>
        <div className="text-center">
          <p className="text-base font-semibold">
            {user?.displayName ?? "Tu nombre"}
          </p>
          <p className="text-sm text-muted-foreground">
            {user?.bio ?? "Tu biografía"}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        {activeLinks.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Los links activos aparecerán aquí.
          </p>
        )}
        {activeLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3 transition-all duration-200",
              "hover:border-primary/30 hover:bg-muted/60 active:scale-[0.98]",
            )}
          >
            <span className="flex size-5 items-center justify-center text-muted-foreground">
              {link.icon ? (
                <Image
                  src={iconUrl(link.icon)}
                  alt={link.title}
                  width={18}
                  height={18}
                  className="size-[18px] object-contain"
                  unoptimized
                />
              ) : (
                <LinkIcon className="size-4" />
              )}
            </span>
            <span className="flex-1 truncate text-sm font-medium">
              {link.title}
            </span>
            <span className="text-xs text-muted-foreground transition-transform group-hover:translate-x-0.5">
              ↗
            </span>
          </a>
        ))}
      </div>

      <div className="mt-auto pt-4 text-center text-xs text-muted-foreground/60">
        devlinks.dev
      </div>
    </div>
  );
}
