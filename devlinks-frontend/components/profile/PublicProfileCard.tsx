"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
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
} from "lucide-react";
import { getDevIconUrl } from "@/lib/api/github.api";
import { cn } from "@/lib/utils";
import type {
  PublicProfile,
  Project,
  PlacedSticker,
  GithubStats,
} from "@/types";
import { iconFromUrl, iconUrl } from "@/lib/icons";
import {
  StickerTile,
  STICKER_BASE_SIZE,
  clampSticker,
  stickerColor,
} from "@/components/profile/StickerTile";
import { getProfileUrl, perceivedLuminance } from "@/lib/utils";
import { ShareProfileDialog } from "@/components/profile/ShareProfileDialog";
import {
  HeatmapCells,
  HeatmapChart,
  HeatmapInteractionBoundary,
  HeatmapInteractionProvider,
  HeatmapLegend,
  HeatmapSeparator,
  HeatmapTooltip,
  HeatmapXAxis,
  HeatmapYAxis,
  type HeatmapColumn,
  type HeatmapLevelStyles,
} from "@/components/charts/heatmap";

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

const HEATMAP_MIX = [0, 42, 62, 82, 100] as const;
const HEATMAP_WEEKS = 26;
const HEATMAP_MARGIN = { top: 18, right: 0, bottom: 0, left: 20 };
const GITHUB_LINK_ID = "github-profile";
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const RELATIVE_TIME = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function timeAgo(ts: number): string {
  const mins = Math.round((ts - Date.now()) / 60_000);
  if (Math.abs(mins) < 60) return RELATIVE_TIME.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return RELATIVE_TIME.format(hours, "hour");
  return RELATIVE_TIME.format(Math.round(hours / 24), "day");
}

function parseDay(iso: string): Date {
  return new Date(
    Number(iso.slice(0, 4)),
    Number(iso.slice(5, 7)) - 1,
    Number(iso.slice(8, 10)),
  );
}

function formatContributionLabel(n: number): string {
  return `${n} ${n === 1 ? "contribución" : "contribuciones"}`;
}

function displayHost(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
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
  wide?: boolean;
}

export function PublicProfileCard({
  profile,
  projects,
  githubStats: initialStats,
  hideShare = false,
  demo = false,
  wide = false,
}: PublicProfileCardProps) {
  const w = (cls: string) => (wide ? cls : "");
  const reduceMotion = useReducedMotion();
  const coverRef = useRef<HTMLDivElement>(null);

  const [githubStats, setGithubStats] = useState<GithubStats | null>(
    initialStats ?? null,
  );

  const [failedPreviews, setFailedPreviews] = useState<Set<string>>(new Set());

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
  const publicUrl = getProfileUrl(profile.username);

  const isLight = perceivedLuminance(profile.bgColor) > 0.5;
  const textPrimary = isLight ? "rgba(0,0,0,0.92)" : "rgba(255,255,255,0.96)";
  const textMuted = isLight ? "rgba(0,0,0,0.74)" : "rgba(255,255,255,0.74)";
  const textSecondary = isLight ? "rgba(0,0,0,0.84)" : "rgba(255,255,255,0.86)";
  const dividerColor = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)";

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
  const iconTileRadius =
    radiusPx >= 9999 ? "9999px" : `${Math.max(radiusPx - 8, 6)}px`;
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
          iconColor: isLight ? "#0e7490" : "#22d3ee",
        },
        {
          label: "Seguidores",
          value: formatCount(githubStats.followers),
          Icon: Users,
          iconColor: isLight ? "#15803d" : "#4ade80",
        },
        {
          label: "Stars",
          value: formatCount(totalStars),
          Icon: Star,
          iconColor: isLight ? "#a16207" : "#facc15",
        },
      ]
    : [];

  const stackLanguages = (githubStats?.topLanguages ?? [])
    .map((l) => ({ ...l, icon: getDevIconUrl(l.language) }))
    .filter((l) => l.icon)
    .slice(0, 4);

  const contributions = githubStats?.contributions ?? [];
  const recentDays = contributions.slice(-(HEATMAP_WEEKS * 7));
  const firstDay = recentDays.length > 0 ? parseDay(recentDays[0].date) : null;
  const gridStart = firstDay
    ? new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() - firstDay.getDay(),
      )
    : null;
  const leadingBlanks = firstDay?.getDay() ?? 0;
  const dayCounts = new Map(
    recentDays.map((d) => [parseDay(d.date).getTime(), d.count]),
  );
  const heatmapColumns: HeatmapColumn[] = gridStart
    ? Array.from(
        { length: Math.ceil((leadingBlanks + recentDays.length) / 7) },
        (_, w) => ({
          bin: w,
          bins: Array.from({ length: 7 }, (_, d) => ({
            bin: d,
            count: recentDays[w * 7 + d - leadingBlanks]?.level ?? 0,
            date: new Date(
              gridStart.getFullYear(),
              gridStart.getMonth(),
              gridStart.getDate() + w * 7 + d,
            ),
          })),
        }),
      )
    : [];
  const periodContributions = recentDays.reduce((s, d) => s + d.count, 0);
  const heatLevelStyles = HEATMAP_MIX.map((mix, level) => ({
    color:
      level === 0
        ? isLight
          ? "rgba(0,0,0,0.08)"
          : "rgba(255,255,255,0.09)"
        : `color-mix(in srgb, ${profile.accentColor} ${mix}%, ${isLight ? "#fff" : profile.bgColor})`,
  })) as unknown as HeatmapLevelStyles;

  const githubUrl =
    profile.githubUsername && !demo
      ? `https://github.com/${profile.githubUsername}`
      : null;
  const hasGithubLink = primaryLinks.some(
    (l) => l.url.replace(/\/$/, "").toLowerCase() === githubUrl?.toLowerCase(),
  );
  const iconLinks: {
    id: string;
    url: string;
    title: string;
    icon?: string | null;
  }[] =
    githubUrl && !hasGithubLink
      ? [
          {
            id: GITHUB_LINK_ID,
            url: githubUrl,
            title: "GitHub",
            icon: "github",
          },
          ...primaryLinks,
        ]
      : primaryLinks;
  const surfaceSubtle = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
  const hasLeftCol = heatmapColumns.length > 0 || hasProjects;
  const splitBody = hasLeftCol && secondaryLinks.length > 0;
  const fullCol = splitBody ? "" : w("lg:col-span-2");

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[480px] rounded-[28px] isolate",
        w("lg:max-w-[1040px]"),
      )}
      style={{
        fontFamily,
        background: wide ? "transparent" : cardBg,
        border: "1px solid transparent",
        boxShadow: wide
          ? "none"
          : `0 0 0 1px ${isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)"}, 0 2px 4px rgba(0,0,0,0.12), 0 16px 48px rgba(0,0,0,0.28)`,
      }}
    >
      {!hideShare && (
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="absolute top-3 right-3 z-30 flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-black/80 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.16)] transition-[scale,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] [-webkit-tap-highlight-color:transparent] hover:bg-white active:scale-[0.96]"
          aria-label="Compartir perfil"
        >
          <Share2 className="size-[18px]" strokeWidth={2} />
        </button>
      )}

      <div className={cn("relative", w("lg:min-h-[460px]"))}>
        <div
          ref={coverRef}
          className={cn(
            "relative h-[300px] w-full overflow-hidden rounded-t-[27px]",
            w(
              "lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[64%] lg:rounded-t-none lg:rounded-tr-[27px]",
            ),
          )}
        >
          <motion.div
            className={cn(
              "absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_55%,transparent_100%)]",
              w(
                "lg:[mask-composite:intersect] lg:[mask-image:linear-gradient(to_right,transparent_0%,#000_55%),linear-gradient(to_bottom,#000_70%,transparent_100%)]",
              ),
            )}
            style={{
              ...coverBg,
              ...(!reduceMotion &&
                !demo && { opacity: coverOpacity, scale: coverScale }),
            }}
          />
        </div>

        <div
          className={cn(
            "relative z-10 px-6",
            w("lg:max-w-[52%] lg:px-12 lg:py-14"),
          )}
        >
          <div
            className={cn(
              "animate-card-rise relative size-[88px] overflow-hidden rounded-full -mt-32",
              w("lg:mt-0"),
            )}
            style={{
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
            className={cn(
              "animate-card-rise [--i:1] mt-3 text-[26px] font-bold leading-tight tracking-[-0.02em] text-balance",
              w("lg:text-[34px]"),
            )}
            style={{ color: textPrimary, fontFamily: titleFontFamily }}
          >
            {profile.displayName}
          </h1>

          {profile.bio && (
            <p
              className="animate-card-rise [--i:2] mt-1.5 text-[15px] leading-relaxed text-pretty"
              style={{
                color: textSecondary,
                fontFamily:
                  profile.bio.length > 40 ? FONT_CSS.inter : undefined,
              }}
            >
              {profile.bio}
            </p>
          )}

          <div className="animate-card-rise [--i:3] mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div
              className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-[14px]"
              style={{ color: textSecondary }}
            >
              <span className="flex items-center gap-1.5">
                <AtSign className="size-4 shrink-0" strokeWidth={1.75} />
                {profile.username}
              </span>
              {profile.location && (
                <span className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="size-4 shrink-0" strokeWidth={1.75} />
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
                      width={22}
                      height={22}
                      unoptimized
                      className="size-[22px] object-contain"
                    />
                  ))}
                </div>
                <span
                  className="text-[14px] font-medium"
                  style={{ color: textPrimary }}
                >
                  Stack
                </span>
              </div>
            )}
          </div>

          {iconLinks.length > 0 && (
            <div className="animate-card-rise [--i:4] mt-4 flex flex-wrap gap-2">
              {iconLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.title}
                  aria-label={`${link.title} (abre en una pestaña nueva)`}
                  onClick={
                    link.id === GITHUB_LINK_ID
                      ? undefined
                      : () => trackClick(link.id)
                  }
                  className="flex size-11 shrink-0 items-center justify-center rounded-full outline-none transition-[scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--row-ring)] active:scale-[0.96] motion-reduce:active:scale-100"
                  style={
                    {
                      background: surfaceSubtle,
                      "--row-ring": profile.accentColor,
                    } as React.CSSProperties
                  }
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

          {statsItems.length > 0 && (
            <dl className="mt-5 flex items-stretch">
              {statsItems.map(({ label, value, Icon, iconColor }, i) => (
                <div
                  key={label}
                  className="animate-card-rise flex flex-col items-center gap-1.5 px-4 first:pl-0"
                  style={
                    {
                      "--i": i,
                      ...(i > 0 && {
                        borderLeft: `1px solid ${dividerColor}`,
                      }),
                    } as React.CSSProperties
                  }
                >
                  <dd className="flex items-center gap-1.5">
                    <Icon
                      aria-hidden="true"
                      className="size-5"
                      strokeWidth={2.25}
                      style={{ color: iconColor }}
                    />
                    <span
                      className="text-[22px] font-semibold tabular-nums leading-none"
                      style={{ color: textPrimary }}
                    >
                      {value}
                    </span>
                  </dd>
                  <dt
                    className="text-[14px] leading-tight"
                    style={{ color: textMuted }}
                  >
                    {label}
                  </dt>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      <div
        className={cn(
          "relative z-10 px-6 pb-8",
          w("lg:grid lg:grid-cols-2 lg:gap-x-12 lg:px-12 lg:pb-10"),
        )}
      >
        {hasLeftCol && (
          <div className={fullCol}>
            {heatmapColumns.length > 0 && githubStats && (
              <section aria-label="Actividad en GitHub">
                <div
                  className="my-5 h-px"
                  style={{ background: dividerColor }}
                />
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
                  style={
                    {
                      "--chart-label": textMuted,
                      "--chart-tooltip-background": isLight
                        ? "#ffffff"
                        : "#18181b",
                      "--chart-tooltip-foreground": isLight
                        ? "#0a0a0a"
                        : "#fafafa",
                      "--chart-tooltip-muted": isLight ? "#52525b" : "#a1a1aa",
                    } as React.CSSProperties
                  }
                >
                  <HeatmapInteractionProvider>
                    <HeatmapInteractionBoundary>
                      <HeatmapChart
                        data={heatmapColumns}
                        layout="fluid"
                        gap={3}
                        margin={HEATMAP_MARGIN}
                        levelStyles={heatLevelStyles}
                        animate={!reduceMotion}
                      >
                        <HeatmapSeparator
                          groupBy="quarter"
                          stroke={dividerColor}
                        />
                        <HeatmapCells cornerRadius={999} />
                        <HeatmapXAxis className="capitalize" />
                        <HeatmapYAxis labelFormat="initial" />
                        <HeatmapTooltip
                          formatLabel={(_, date) =>
                            formatContributionLabel(
                              dayCounts.get(date.getTime()) ?? 0,
                            )
                          }
                        />
                      </HeatmapChart>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <span
                          className="whitespace-nowrap text-[11px]"
                          style={{ color: textMuted }}
                        >
                          {formatCount(githubStats.totalContributions)} en el
                          último año
                        </span>
                        <HeatmapLegend
                          cornerRadius={999}
                          cellSize={10}
                          gap={3}
                          levelStyles={heatLevelStyles}
                          lessLabel="Menos"
                          moreLabel="Más"
                          labelClassName="text-chart-label"
                        />
                      </div>
                    </HeatmapInteractionBoundary>
                  </HeatmapInteractionProvider>
                </div>
              </section>
            )}

            {hasProjects && (
              <>
                <div
                  className="my-5 h-px"
                  style={{ background: dividerColor }}
                />
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
                      initial={
                        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: i * 0.05,
                        ease: EASE_OUT,
                      }}
                      style={
                        i > 0
                          ? { borderTop: `1px solid ${dividerColor}` }
                          : undefined
                      }
                    >
                      <a
                        href={project.url ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group -mx-2 flex min-h-11 items-center gap-3 rounded-lg px-2 py-3 outline-none transition-[background-color,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[var(--row-hover)] focus-visible:ring-2 focus-visible:ring-[var(--row-ring)] active:scale-[0.99] motion-reduce:active:scale-100"
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
                            <Star
                              aria-hidden="true"
                              className="size-3 fill-current"
                            />
                            <span className="sr-only">Stars:</span>
                            {project.stars >= 1000
                              ? `${(project.stars / 1000).toFixed(1)}k`
                              : project.stars}
                          </span>
                        )}
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-4 shrink-0 opacity-30 transition-[opacity,translate] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:opacity-100 group-focus-visible:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                          style={{ color: textPrimary }}
                        />
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {secondaryLinks.length > 0 && (
          <div className={fullCol}>
            <div className="my-5 h-px" style={{ background: dividerColor }} />
            <h2
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: textSecondary }}
            >
              Links
            </h2>
            <div className="flex flex-col gap-2">
              {secondaryLinks.map((link, i) => {
                const preview = failedPreviews.has(link.id)
                  ? null
                  : link.previewImage;
                const isFeatured = link.layout === "featured" && !!preview;
                const featuredText = isFeatured ? "#ffffff" : linkText;
                const host = displayHost(link.url);
                const linkIcon = link.icon || iconFromUrl(link.url);
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackClick(link.id)}
                    className={cn(
                      "group flex w-full overflow-hidden [-webkit-tap-highlight-color:transparent]",
                      isFeatured
                        ? "relative flex-col"
                        : "min-h-[60px] items-center",
                    )}
                    style={{
                      borderRadius: isFeatured ? featuredRadius : bRadius,
                      ...(isFeatured
                        ? {
                            border: `1px solid ${bColor}35`,
                            background: `${bColor}14`,
                          }
                        : linkStyle),
                    }}
                    initial={
                      reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }
                    }
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: 0.2,
                        delay: i * 0.05,
                        ease: EASE_OUT,
                      },
                    }}
                    whileHover={
                      reduceMotion
                        ? undefined
                        : { y: -2, boxShadow: `0 10px 28px -10px ${bColor}99` }
                    }
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15, ease: EASE_OUT }}
                  >
                    {isFeatured && (
                      <Image
                        src={preview!}
                        alt=""
                        width={480}
                        height={251}
                        className="aspect-[1.91/1] w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:group-hover:scale-[1.03]"
                        unoptimized
                        onError={() =>
                          setFailedPreviews((prev) =>
                            new Set(prev).add(link.id),
                          )
                        }
                      />
                    )}
                    <div
                      className={cn(
                        "flex w-full items-center gap-3 py-2 pl-2 pr-4",
                        isFeatured && "absolute inset-x-0 bottom-0 pt-12",
                      )}
                      style={
                        isFeatured
                          ? {
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
                            }
                          : undefined
                      }
                    >
                      <span
                        className="flex size-10 shrink-0 items-center justify-center overflow-hidden"
                        style={{
                          borderRadius: iconTileRadius,
                          background: `color-mix(in srgb, ${featuredText} ${isFeatured ? 18 : 12}%, transparent)`,
                        }}
                      >
                        {!isFeatured && preview ? (
                          <Image
                            src={preview}
                            alt=""
                            width={40}
                            height={40}
                            unoptimized
                            onError={() =>
                              setFailedPreviews((prev) =>
                                new Set(prev).add(link.id),
                              )
                            }
                            className="size-full object-cover"
                          />
                        ) : linkIcon ? (
                          <Image
                            src={iconUrl(
                              linkIcon,
                              isFeatured ? "#ffffff" : linkIconColor,
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
                            style={{
                              color: isFeatured
                                ? "rgba(255,255,255,0.72)"
                                : linkMuted,
                            }}
                          >
                            {host}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 shrink-0 opacity-70 transition-[opacity,translate] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                        strokeWidth={2}
                        style={{ color: featuredText }}
                      />
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        )}

        <div className={cn("mt-10 text-center", w("lg:col-span-2"))}>
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

      <ShareProfileDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        profile={profile}
        publicUrl={publicUrl}
        cardBg={cardBg}
        textPrimary={textPrimary}
      />

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
              <div
                key={`${sticker.id}-${idx}`}
                className="absolute"
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  marginLeft: -size / 2,
                  marginTop: -size / 2,
                  rotate: `${sticker.rotation ?? 0}deg`,
                }}
              >
                <div
                  style={
                    isFloating
                      ? {
                          animation: `sticker-float ${2.6 + (idx % 3) * 0.5}s ease-in-out ${(idx % 4) * 0.25}s infinite`,
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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
