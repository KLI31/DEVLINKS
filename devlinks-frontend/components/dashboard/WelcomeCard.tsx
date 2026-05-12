"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { getProfileUrl } from "@/lib/utils";

export function WelcomeCard() {
  const { user } = useAuthStore();

  if (!user) return null;

  const profileUrl = getProfileUrl(user.username);

  const userBio =
    user.bio?.trim() || "Construyendo productos y compartiendo código.";

  return (
    <div className="rounded-xl border border-border/70 bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName || user.username}
                width={40}
                height={40}
                className="rounded-full object-cover ring-1 ring-border/60"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-1 ring-border/60">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">
              {user.displayName || user.username}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              @{user.username}
            </span>
            <span className="max-w-[22rem] truncate text-xs text-muted-foreground/90">
              {userBio}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm font-medium shadow-xs transition-all hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver perfil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
