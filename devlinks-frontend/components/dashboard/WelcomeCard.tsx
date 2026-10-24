"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { githubApi, getDevIconUrl } from "@/lib/api/github.api";
import { cn, getProfileUrl } from "@/lib/utils";

interface WelcomeCardProps {
  linksCount: number;
}

export function WelcomeCard({ linksCount }: WelcomeCardProps) {
  const { user } = useAuthStore();
  const [stack, setStack] = useState<string[]>([]);
  const githubUsername = user?.githubUsername ?? null;

  useEffect(() => {
    if (!githubUsername) return;
    let cancelled = false;
    githubApi
      .getStats(githubUsername)
      .then((s) => {
        if (!cancelled) setStack(s.topLanguages.slice(0, 5).map((l) => l.language));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [githubUsername]);

  if (!user) return null;

  const profileUrl = getProfileUrl(user.username);
  const name = user.displayName || user.username;

  const steps = [
    {
      label: "Conecta GitHub",
      done: !!user.githubUsername,
      href: "/api/auth/github",
    },
    {
      label: "Agrega tu primer link",
      done: linksCount > 0,
      href: "/dashboard/links",
    },
    {
      label: "Escribe tu bio",
      done: !!user.bio?.trim(),
      href: "/dashboard/settings",
    },
    {
      label: "Sube un avatar",
      done: !!user.avatarUrl,
      href: "/dashboard/settings",
    },
  ];
  const completed = steps.filter((s) => s.done).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-5">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={name}
              width={72}
              height={72}
              className="size-[72px] shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
            />
          ) : (
            <div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="font-mono text-xs text-muted-foreground">
              @{user.username}
            </span>
            <h1 className="text-balance text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              {name}
            </h1>
            <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
              {user.bio?.trim() ||
                "Construyendo productos y compartiendo código."}
            </p>
            {stack.length > 0 && (
              <ul
                aria-label="Stack principal"
                className="mt-1 flex flex-wrap items-center gap-2"
              >
                {stack.map((lang) => {
                  const icon = getDevIconUrl(lang);
                  return (
                    <li
                      key={lang}
                      className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 px-2 font-mono text-xs text-foreground"
                    >
                      {icon && (
                        <Image
                          src={icon}
                          alt=""
                          width={14}
                          height={14}
                          unoptimized
                          className="object-contain"
                        />
                      )}
                      {lang}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-primary/90 motion-safe:active:scale-[0.96] sm:self-center"
        >
          <ExternalLink className="size-4" />
          Ver perfil
        </a>
      </div>

      {completed < steps.length && (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-medium text-foreground">
              Completa tu perfil
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">
              {completed}/{steps.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="Progreso del perfil"
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-valuenow={completed}
            className="h-1.5 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full origin-left rounded-full bg-primary transition-[scale] duration-500 ease-out motion-reduce:transition-none"
              style={{ scale: `${completed / steps.length} 1` }}
            />
          </div>
          <ul className="flex flex-wrap gap-2">
            {steps.map(({ label, done, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  aria-disabled={done}
                  tabIndex={done ? -1 : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors duration-150",
                    done
                      ? "pointer-events-none border-transparent text-muted-foreground line-through"
                      : "border-border/70 bg-card text-foreground hover:border-primary/40 hover:text-primary",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-3.5 items-center justify-center rounded-full border",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/50",
                    )}
                  >
                    {done && <Check className="size-2.5" strokeWidth={3} />}
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
