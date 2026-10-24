"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import {
  MapPin,
  Star,
  ArrowUpRight,
  Link2,
  Code2,
  Users,
  AtSign,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { getDevIconUrl } from "@/lib/api/github.api";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import type {
  PublicProfile,
  Project,
  PlacedSticker,
  GithubStats,
} from "@/types";
import { iconUrl } from "@/lib/icons";
import {
  StickerTile,
  STICKER_BASE_SIZE,
  clampSticker,
  stickerColor,
} from "@/components/profile/StickerTile";
import { getProfileUrl } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const BUTTON_SHADOW_CSS: Record<string, string> = {
  none: "none",
  soft: "0 2px 8px rgba(0,0,0,0.18)",
  strong: "0 4px 16px rgba(0,0,0,0.38)",
  hard: "2px 3px 0px rgba(0,0,0,0.55)",
};

const FONT_CSS: Record<string, string> = {
  "jetbrains-mono": "'JetBrains Mono', monospace",
  "fira-code": "'Fira Code', monospace",
  mono: "ui-monospace, monospace",
  inter: "'Inter', sans-serif",
  poppins: "'Poppins', sans-serif",
  "space-grotesk": "'Space Grotesk', sans-serif",
  outfit: "'Outfit', sans-serif",
  "dm-sans": "'DM Sans', sans-serif",
  playfair: "'Playfair Display', serif",
  fraunces: "'Fraunces', serif",
};

const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Rust: "#dea584",
  Python: "#3776AB",
  Ruby: "#CC342D",
  Java: "#b07219",
  "C#": "#178600",
  "C++": "#f34b7d",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
};

const HEATMAP_MIX = [0, 30, 55, 80, 100] as const;
const HEATMAP_WEEKS = 26;

const RELATIVE_TIME = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function timeAgo(ts: number): string {
  const mins = Math.round((ts - Date.now()) / 60_000);
  if (Math.abs(mins) < 60) return RELATIVE_TIME.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return RELATIVE_TIME.format(hours, "hour");
  return RELATIVE_TIME.format(Math.round(hours / 24), "day");
}

function formatDay(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const COVER_FADE =
  "linear-gradient(to bottom, #000 55%, transparent 100%)";

function displayHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function perceivedLuminance(hex: string): number {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

interface PublicProfileCardProps {
  profile: PublicProfile;
  projects: Project[];
  githubStats?: GithubStats | null;
  hideShare?: boolean;
  demo?: boolean;
}

export function PublicProfileCard({
  profile,
  projects,
  githubStats: initialStats,
  hideShare = false,
  demo = false,
}: PublicProfileCardProps) {
  const { notifySuccess, notifyError } = useNotifications();
  const reduceMotion = useReducedMotion();
  const coverRef = useRef<HTMLDivElement>(null);

  const [githubStats, setGithubStats] = useState<GithubStats | null>(
    initialStats ?? null,
  );

  useEffect(() => {
    if (initialStats !== undefined) return;
    if (!profile.githubUsername) return;
    fetch(`/api/user/${profile.username}/github-stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setGithubStats(data);
      })
      .catch(() => {});
  }, [profile.username, profile.githubUsername, initialStats]);

  const trackClick = (linkId: string) => {
    fetch(`/api/links/${linkId}/click`, { method: "POST" }).catch(() => {});
  };
  const { scrollY } = useScroll();
  const coverOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const coverScale = useTransform(scrollY, [0, 300], [1, 1.07]);

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const publicUrl = getProfileUrl(profile.username);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      notifySuccess("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notifyError("Error al copiar el link");
    }
  };

  const isLight = perceivedLuminance(profile.bgColor) > 0.5;
  const textPrimary = isLight ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.92)";
  const textMuted = isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.32)";
  const textSecondary = isLight ? "rgba(0,0,0,0.58)" : "rgba(255,255,255,0.62)";
  const dividerColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  const fontFamily = FONT_CSS[profile.fontFamily] ?? FONT_CSS["jetbrains-mono"];
  const titleFontFamily = profile.altTitleFont
    ? (FONT_CSS[(profile as unknown as Record<string, string>).titleFont] ??
      FONT_CSS["playfair"])
    : fontFamily;

  const bRadius = `${profile.buttonRadius ?? 8}px`;
  const featuredRadius = `${Math.min(profile.buttonRadius ?? 8, 24)}px`;
  const bVariant = profile.buttonVariant ?? "solid";
  const isOutline = bVariant === "outline";
  const isGlass = bVariant === "glass";
  const bColor = profile.buttonColor ?? profile.accentColor;
  const isSolid = !isOutline && !isGlass;
  const linkText = isSolid
    ? (profile.buttonTextColor ??
      (perceivedLuminance(bColor) > 0.5 ? "#0a0a0a" : "#ffffff"))
    : textPrimary;
  const linkMuted = isSolid
    ? `color-mix(in srgb, ${linkText} 68%, transparent)`
    : textSecondary;
  const linkIconColor = isSolid ? linkText : profile.accentColor;
  const radiusPx = profile.buttonRadius ?? 8;
  const iconTileRadius = radiusPx >= 9999 ? "9999px" : `${Math.max(radiusPx - 8, 6)}px`;
  const bShadow = BUTTON_SHADOW_CSS[profile.buttonShadow ?? "none"] ?? "none";

  const cardBg =
    profile.bgType === "gradient"
      ? `linear-gradient(160deg, ${profile.bgColor} 0%, color-mix(in srgb, ${profile.bgColor} 75%, ${profile.accentColor} 25%) 100%)`
      : profile.bgColor;

  const hasCoverUrl = Boolean(profile.coverImageUrl);
  const coverBg = hasCoverUrl
    ? {
        backgroundImage: `url(${profile.coverImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        background: `radial-gradient(120% 80% at 20% 0%, ${profile.accentColor}90 0%, transparent 60%), radial-gradient(90% 70% at 90% 30%, color-mix(in srgb, ${profile.accentColor} 45%, #000) 0%, transparent 65%), linear-gradient(160deg, color-mix(in srgb, ${profile.bgColor} 70%, ${profile.accentColor}) 0%, ${profile.bgColor} 100%)`,
      };

  const linkStyle = isOutline
    ? {
        border: `1px solid ${bColor}55`,
        background: "transparent",
        boxShadow: bShadow,
      }
    : isGlass
      ? {
          border: `1px solid ${bColor}30`,
          background: `${bColor}18`,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: bShadow,
        }
      : {
          border: "1px solid transparent",
          background: bColor,
          boxShadow: bShadow,
        };

  const stickers: PlacedSticker[] = Array.isArray(profile.stickers)
    ? profile.stickers
    : [];
  const sortedLinks = [...profile.links].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  const primaryLinks = sortedLinks.filter((link) => link.isPrimary);
  const secondaryLinks = sortedLinks.filter((l) => !l.isPrimary);
  const hasProjects = projects.length > 0;

  const totalStars =
    githubStats?.topRepos.reduce((s, r) => s + r.stargazers_count, 0) ?? 0;
  const statsItems = githubStats
    ? [
        {
          label: "Repositorios",
          value: formatCount(githubStats.totalRepos),
          Icon: Code2,
          iconColor: "#22d3ee",
        },
        {
          label: "Seguidores",
          value: formatCount(githubStats.followers),
          Icon: Users,
          iconColor: "#4ade80",
        },
        {
          label: "Stars",
          value: formatCount(totalStars),
          Icon: Star,
          iconColor: "#facc15",
        },
      ]
    : [];

  const stackLanguages = (githubStats?.topLanguages ?? [])
    .map((l) => ({ ...l, icon: getDevIconUrl(l.language) }))
    .filter((l) => l.icon)
    .slice(0, 4);

  const contributions = githubStats?.contributions ?? [];
  const recentDays = contributions.slice(-(HEATMAP_WEEKS * 7));
  // Las fechas se normalizan a YYYY-MM-DD (UTC); getUTCDay evita el corrimiento de un día en zonas horarias negativas.
  const firstDow =
    recentDays.length > 0
      ? new Date(`${recentDays[0].date.slice(0, 10)}T00:00:00Z`).getUTCDay()
      : 0;
  const paddedDays = [...Array(firstDow).fill(null), ...recentDays];
  const heatmapWeeks: ((typeof recentDays)[0] | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    heatmapWeeks.push(paddedDays.slice(i, i + 7));
  }
  let lastLabelWeek = -3;
  const monthLabels = heatmapWeeks.map((week, wi) => {
    const firstOfMonth = week.find(
      (d) => d && Number(d.date.slice(8, 10)) <= 7,
    );
    if (!firstOfMonth || wi - lastLabelWeek < 3) return null;
    lastLabelWeek = wi;
    return new Date(`${firstOfMonth.date.slice(0, 10)}T00:00:00Z`).toLocaleDateString("es", {
      month: "short",
      timeZone: "UTC",
    });
  });
  const periodContributions = recentDays.reduce((s, d) => s + d.count, 0);
  const heatColor = (level: number) =>
    level === 0
      ? isLight
        ? "rgba(0,0,0,0.06)"
        : "rgba(255,255,255,0.06)"
      : `color-mix(in srgb, ${profile.accentColor} ${HEATMAP_MIX[level]}%, ${isLight ? "#fff" : profile.bgColor})`;

  const ctaHref = profile.githubUsername && !demo
    ? `https://github.com/${profile.githubUsername}`
    : null;
  const surfaceSubtle = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
  const coverHeight = 300;

  return (
    <div
      className="relative mx-auto w-full max-w-[480px] rounded-[28px] isolate"
      style={{
        fontFamily,
        background: cardBg,
        border: "1px solid transparent",
        boxShadow: `0 0 0 1px ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}, 0 2px 4px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.28)`,
      }}
    >
      {!hideShare && (
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="absolute top-3 right-3 z-30 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-black/80 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.16)] transition-[scale,background-color] duration-150 ease-out [-webkit-tap-highlight-color:transparent] hover:bg-white active:scale-[0.96]"
          aria-label="Compartir perfil"
        >
          <Share2 className="size-[18px]" strokeWidth={2} />
        </button>
      )}

      <div
        ref={coverRef}
        className="relative w-full overflow-hidden rounded-t-[27px]"
        style={{ height: coverHeight }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            ...coverBg,
            ...(!reduceMotion &&
              !demo && { opacity: coverOpacity, scale: coverScale }),
            WebkitMaskImage: COVER_FADE,
            maskImage: COVER_FADE,
          }}
        />
      </div>

      <div className="relative z-10 px-6 pb-8">
        <div
          className="relative size-[88px] overflow-hidden rounded-full"
          style={{
            marginTop: -128,
            background: profile.avatarUrl
              ? profile.bgColor
              : `color-mix(in srgb, ${profile.accentColor} 25%, ${profile.bgColor})`,
            boxShadow: demo
              ? "0 12px 32px rgba(0,0,0,0.32)"
              : `0 0 0 3px ${profile.bgColor}, 0 0 0 5px ${profile.accentColor}99, 0 12px 32px rgba(0,0,0,0.32)`,
          }}
        >
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.displayName}
              width={88}
              height={88}
              className={cn(
                "size-full rounded-full object-cover outline-1 -outline-offset-1",
                isLight ? "outline-black/10" : "outline-white/10",
              )}
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <span
                className="text-xl font-bold"
                style={{ color: textPrimary }}
              >
                {profile.displayName.slice(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <h1
          className="mt-3 text-[26px] font-bold leading-tight tracking-[-0.02em] text-balance"
          style={{ color: textPrimary, fontFamily: titleFontFamily }}
        >
          {profile.displayName}
        </h1>

        {profile.bio && (
          <p
            className="mt-1 text-[13px] leading-relaxed text-pretty"
            style={{
              color: textSecondary,
              fontFamily:
                profile.bio.length > 40 ? FONT_CSS.inter : undefined,
            }}
          >
            {profile.bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div
            className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-[12px]"
            style={{ color: textSecondary }}
          >
            <span className="flex items-center gap-1.5">
              <AtSign className="size-3.5 shrink-0" strokeWidth={1.75} />
              {profile.username}
            </span>
            {profile.location && (
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{profile.location}</span>
              </span>
            )}
          </div>

          {stackLanguages.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {stackLanguages.map((l) => (
                  <Image
                    key={l.language}
                    src={l.icon!}
                    alt={l.language}
                    title={`${l.language} · ${l.pct}%`}
                    width={16}
                    height={16}
                    unoptimized
                    className="size-4 object-contain"
                  />
                ))}
              </div>
              <span
                className="text-[12px] font-medium"
                style={{ color: textPrimary }}
              >
                Stack
              </span>
            </div>
          )}
        </div>

        {primaryLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {primaryLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                title={link.title}
                aria-label={link.title}
                onClick={() => trackClick(link.id)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full transition-[scale,opacity] duration-150 ease-out hover:opacity-80 active:scale-[0.96]"
                style={{ background: surfaceSubtle }}
              >
                <Image
                  src={iconUrl(link.icon ?? "link", profile.accentColor)}
                  alt=""
                  width={20}
                  height={20}
                  unoptimized
                  className="size-5 object-contain"
                />
              </a>
            ))}
          </div>
        )}

        {(statsItems.length > 0 || ctaHref) && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            {statsItems.length > 0 && (
              <dl className="flex items-stretch">
                {statsItems.map(({ label, value, Icon, iconColor }, i) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 px-3.5 first:pl-0"
                    style={
                      i > 0
                        ? { borderLeft: `1px solid ${dividerColor}` }
                        : undefined
                    }
                  >
                    <dd className="flex items-center gap-1.5">
                      <Icon
                        className="size-3.5"
                        strokeWidth={2.25}
                        style={{ color: iconColor }}
                      />
                      <span
                        className="text-[15px] font-semibold tabular-nums leading-none"
                        style={{ color: textPrimary }}
                      >
                        {value}
                      </span>
                    </dd>
                    <dt
                      className="text-[11px] leading-tight"
                      style={{ color: textMuted }}
                    >
                      {label}
                    </dt>
                  </div>
                ))}
              </dl>
            )}

            {ctaHref && (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver perfil de ${profile.githubUsername} en GitHub (abre en una pestaña nueva)`}
                className="group ml-auto flex h-11 items-center gap-2.5 rounded-xl pl-2 pr-3 text-[13px] font-medium outline-none transition-[scale,background-color,border-color] duration-150 ease-out hover:bg-[var(--cta-hover)] focus-visible:ring-2 focus-visible:ring-[var(--cta-ring)] active:scale-[0.97] motion-reduce:active:scale-100"
                style={
                  {
                    color: textPrimary,
                    "--cta-hover": isLight
                      ? "rgba(0,0,0,0.09)"
                      : "rgba(255,255,255,0.1)",
                    "--cta-ring": profile.accentColor,
                  } as React.CSSProperties
                }
              >
                <span
                  className="flex size-7 items-center justify-center rounded-lg"
                  style={{
                    background: isLight ? "#111" : "rgba(255,255,255,0.94)",
                    color: isLight ? "#fff" : "#0a0a0a",
                  }}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </span>
                <span className="flex flex-col leading-none">
                  <span className="text-[10px]" style={{ color: textMuted }}>
                    github.com/
                  </span>
                  <span className="mt-0.5 max-w-[9rem] truncate">
                    {profile.githubUsername}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 opacity-50 transition-[opacity,translate] duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                />
              </a>
            )}
          </div>
        )}

        {heatmapWeeks.length > 0 && githubStats && (
          <section aria-label="Actividad en GitHub">
            <div className="my-5 h-px" style={{ background: dividerColor }} />
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2
                className="text-[11px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: textMuted }}
              >
                Actividad
              </h2>
              <span
                className="text-[11px] tabular-nums"
                style={{ color: textMuted }}
                suppressHydrationWarning
              >
                <span style={{ color: textPrimary }}>
                  {formatCount(periodContributions)}
                </span>{" "}
                contribuciones · {timeAgo(githubStats.fetchedAt)}
              </span>
            </div>

            <div
              role="img"
              aria-label={`${periodContributions} contribuciones en los últimos ${HEATMAP_WEEKS * 7} días`}
              className="grid gap-[3px]"
              style={{
                gridTemplateColumns: `repeat(${heatmapWeeks.length}, minmax(0, 1fr))`,
              }}
            >
              {monthLabels.map((label, wi) => (
                <span
                  key={`m-${wi}`}
                  aria-hidden
                  className="h-4 overflow-visible whitespace-nowrap text-[10px] capitalize leading-none"
                  style={{ gridRow: 1, gridColumn: wi + 1, color: textMuted }}
                >
                  {label}
                </span>
              ))}
              {heatmapWeeks.flatMap((week, wi) =>
                Array.from({ length: 7 }, (_, di) => {
                  const day = week[di] ?? null;
                  return (
                    <span
                      key={`${wi}-${di}`}
                      aria-hidden
                      title={
                        day
                          ? `${day.count} contribuciones · ${formatDay(day.date)}`
                          : undefined
                      }
                      className="aspect-square w-full rounded-[3px]"
                      style={{
                        gridRow: di + 2,
                        gridColumn: wi + 1,
                        background: day ? heatColor(day.level) : "transparent",
                        boxShadow:
                          day && day.level > 0
                            ? "inset 0 0 0 1px rgba(255,255,255,0.06)"
                            : undefined,
                      }}
                    />
                  );
                }),
              )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px]" style={{ color: textMuted }}>
                {formatCount(githubStats.totalContributions)} en el último año
              </span>
              <div className="flex items-center gap-1" aria-hidden>
                <span className="mr-1 text-[10px]" style={{ color: textMuted }}>
                  Menos
                </span>
                {HEATMAP_MIX.map((_, level) => (
                  <span
                    key={level}
                    className="size-2.5 rounded-[2px]"
                    style={{ background: heatColor(level) }}
                  />
                ))}
                <span className="ml-1 text-[10px]" style={{ color: textMuted }}>
                  Más
                </span>
              </div>
            </div>
          </section>
        )}

        {hasProjects && (
          <>
            <div className="my-5 h-px" style={{ background: dividerColor }} />
            <h2
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: textMuted }}
            >
              Proyectos destacados
            </h2>
            <ul className="flex flex-col">
              {projects.map((project, i) => (
                <motion.li
                  key={project.id}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: i * 0.05,
                    ease: "easeOut",
                  }}
                  style={i > 0 ? { borderTop: `1px solid ${dividerColor}` } : undefined}
                >
                  <a
                    href={project.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group -mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 py-3 outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-[var(--row-hover)] focus-visible:ring-2 focus-visible:ring-[var(--row-ring)] active:scale-[0.99] motion-reduce:active:scale-100"
                    style={
                      {
                        "--row-hover": surfaceSubtle,
                        "--row-ring": profile.accentColor,
                      } as React.CSSProperties
                    }
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate text-[13px] font-medium leading-tight"
                        style={{ color: textPrimary }}
                      >
                        {project.title || project.githubRepo}
                      </span>
                      {project.description && (
                        <span
                          className="mt-1 block truncate text-[11px] leading-snug"
                          style={{ color: textMuted }}
                        >
                          {project.description}
                        </span>
                      )}
                    </span>

                    {project.language && (
                      <span
                        className="flex shrink-0 items-center gap-1.5 text-[11px]"
                        style={{ color: textMuted }}
                      >
                        <span
                          aria-hidden="true"
                          className="block size-1.5 rounded-full"
                          style={{
                            background:
                              LANG_COLOR[project.language] ??
                              profile.accentColor,
                          }}
                        />
                        {project.language}
                      </span>
                    )}
                    {project.stars > 0 && (
                      <span
                        className="flex shrink-0 items-center gap-1 text-[11px] tabular-nums"
                        style={{ color: textMuted }}
                      >
                        <Star aria-hidden="true" className="size-3 fill-current" />
                        <span className="sr-only">Stars:</span>
                        {project.stars >= 1000
                          ? `${(project.stars / 1000).toFixed(1)}k`
                          : project.stars}
                      </span>
                    )}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-4 shrink-0 opacity-30 transition-[opacity,translate] duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                      style={{ color: textPrimary }}
                    />
                  </a>
                </motion.li>
              ))}
            </ul>
          </>
        )}

        {secondaryLinks.length > 0 && (
          <>
            <div className="my-5 h-px" style={{ background: dividerColor }} />
            <h2
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: textMuted }}
            >
              Links
            </h2>
            <div className="flex flex-col gap-2">
              {secondaryLinks.map((link, i) => {
                const isFeatured =
                  link.layout === "featured" && link.previewImage;
                const featuredText = isFeatured ? textPrimary : linkText;
                const host = displayHost(link.url);
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(link.id)}
                    className={cn(
                      "group flex w-full overflow-hidden [-webkit-tap-highlight-color:transparent]",
                      isFeatured ? "flex-col" : "min-h-[60px] items-center",
                    )}
                    style={{
                      borderRadius: isFeatured ? featuredRadius : bRadius,
                      ...(isFeatured
                        ? {
                            border: `1px solid ${bColor}35`,
                            background: `${bColor}08`,
                          }
                        : linkStyle),
                    }}
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                    whileHover={reduceMotion ? undefined : { y: -2, boxShadow: `0 10px 28px -10px ${bColor}99` }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {isFeatured && (
                      <Image
                        src={link.previewImage!}
                        alt=""
                        width={480}
                        height={140}
                        className="h-[140px] w-full object-cover"
                        unoptimized
                      />
                    )}
                    <div className="flex w-full items-center gap-3 py-2 pl-2 pr-4">
                      <span
                        className="flex size-10 shrink-0 items-center justify-center overflow-hidden"
                        style={{
                          borderRadius: iconTileRadius,
                          background: `color-mix(in srgb, ${featuredText} 12%, transparent)`,
                        }}
                      >
                        {!isFeatured && link.previewImage ? (
                          <Image
                            src={link.previewImage}
                            alt=""
                            width={40}
                            height={40}
                            unoptimized
                            className="size-full object-cover"
                          />
                        ) : link.icon ? (
                          <Image
                            src={iconUrl(
                              link.icon,
                              isFeatured ? profile.accentColor : linkIconColor,
                            )}
                            alt=""
                            width={18}
                            height={18}
                            unoptimized
                            className="size-[18px] object-contain"
                          />
                        ) : (
                          <Link2
                            className="size-[18px]"
                            strokeWidth={2}
                            style={{ color: featuredText }}
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate text-[15px] font-semibold leading-snug"
                          style={{ color: featuredText }}
                        >
                          {link.title}
                        </span>
                        {host && (
                          <span
                            className="block truncate text-[11px] leading-snug"
                            style={{ color: isFeatured ? textSecondary : linkMuted }}
                          >
                            {host}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 opacity-50 transition-[opacity,translate] duration-150 ease-out group-hover:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                        strokeWidth={2}
                        style={{ color: featuredText }}
                      />
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-10 text-center">
          <span
            className="text-[10px] uppercase tracking-[0.08em]"
            style={{ color: textMuted }}
          >
            Creado por
            <Image
              src="/logo.svg"
              alt="DevLinks"
              width={14}
              height={14}
              className="mx-1 inline-block"
            />
            DevLinks
          </span>
        </div>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="gap-6 sm:max-w-sm">
          <DialogTitle className="sr-only">Compartir perfil</DialogTitle>

          <div className="flex flex-col items-center gap-5">
            <p className="text-base font-semibold text-foreground">
              Compartir perfil
            </p>

            <div
              className="flex w-full flex-col items-center gap-4 rounded-[24px] p-8"
              style={{
                background: cardBg,
                border: `1px solid ${profile.accentColor}20`,
              }}
            >
              <div
                className="size-[88px] overflow-hidden rounded-full"
                style={{
                  background: profile.avatarUrl
                    ? "transparent"
                    : `${profile.accentColor}25`,
                  boxShadow: `0 0 0 3px ${profile.bgColor}, 0 0 0 5px ${profile.accentColor}80, 0 6px 28px ${profile.accentColor}55`,
                }}
              >
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    width={88}
                    height={88}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <span
                      className="text-lg font-bold"
                      style={{ color: textPrimary }}
                    >
                      {profile.displayName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-lg font-bold"
                  style={{ color: textPrimary }}
                >
                  {profile.displayName}
                </span>
                <span
                  className="flex items-center gap-1 text-sm"
                  style={{ color: `${profile.accentColor}cc` }}
                >
                  <Image
                    src="/logo.svg"
                    alt="DevLinks"
                    width={14}
                    height={14}
                    className="inline-block"
                  />
                  /{profile.username}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm cursor-pointer font-medium text-white transition-[scale,opacity] duration-150 ease-out hover:opacity-90 active:scale-[0.96]"
              style={{ background: profile.accentColor }}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              {copied ? "Link copiado" : "Copiar link"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {stickers.length > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[28px] lg:overflow-visible"
        >
          {stickers.map((raw, idx) => {
            const sticker = clampSticker(raw);
            const size = Math.round(STICKER_BASE_SIZE * (sticker.scale ?? 1));
            const isFloating = Boolean(sticker.animated) && !reduceMotion;
            return (
              <motion.div
                key={`${sticker.id}-${idx}`}
                className="absolute"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  rotate: sticker.rotation,
                }}
                animate={isFloating ? { y: [0, -7, 0] } : undefined}
                transition={
                  isFloating
                    ? {
                        duration: 2.6 + (idx % 3) * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: (idx % 4) * 0.25,
                      }
                    : undefined
                }
              >
                <StickerTile
                  slug={sticker.id}
                  color={stickerColor(sticker.id, profile.accentColor)}
                  size={size}
                  live={isFloating}
                  delay={(idx % 4) * 0.8}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
