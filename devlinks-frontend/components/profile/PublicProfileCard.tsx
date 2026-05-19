"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  MapPin,
  Link2,
  Star,
  ChevronRight,
  ExternalLink,
  Code2,
  Users,
  UserCheck,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  PublicProfile,
  Project,
  PlacedSticker,
  GithubStats,
} from "@/types";
import { iconUrl } from "@/lib/icons";
import { getDevIconUrl } from "@/lib/api/github.api";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";
import { getProfileUrl } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const BUTTON_RADIUS: Record<string, string> = {
  "rounded-fill": "8px",
  "sharp-fill": "2px",
  "pill-fill": "9999px",
  "rounded-outline": "8px",
  "sharp-outline": "2px",
  "pill-outline": "9999px",
};

const IS_OUTLINE: Record<string, boolean> = {
  "rounded-outline": true,
  "sharp-outline": true,
  "pill-outline": true,
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

const HEATMAP_ALPHA = ["0d", "2a", "55", "88", "cc"] as const;

const PROJECT_TITLE_COLORS = [
  "#60a5fa", // blue-400
  "#34d399", // emerald-400
  "#a78bfa", // violet-400
  "#f472b6", // pink-400
  "#fb923c", // orange-400
  "#22d3ee", // cyan-400
  "#4ade80", // green-400
  "#e879f9", // fuchsia-400
] as const;

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
}

export function PublicProfileCard({
  profile,
  projects,
  githubStats,
  hideShare = false,
}: PublicProfileCardProps) {
  const coverRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const coverOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const coverScale = useTransform(scrollY, [0, 300], [1, 1.07]);
  const coverBlurPx = useTransform(scrollY, [0, 300], [0, 10]);
  const coverBlurFilter = useTransform(coverBlurPx, (v) => `blur(${v}px)`);

  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const publicUrl = getProfileUrl(profile.username);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error al copiar el link");
    }
  };

  const isLight = perceivedLuminance(profile.bgColor) > 0.5;
  const textPrimary = isLight ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.92)";
  const textMuted = isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.32)";
  const dividerColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  const fontFamily = FONT_CSS[profile.fontFamily] ?? FONT_CSS["jetbrains-mono"];
  const buttonRadius = BUTTON_RADIUS[profile.buttonStyle] ?? "8px";
  const isOutline = IS_OUTLINE[profile.buttonStyle] ?? false;

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
    : profile.bgType === "gradient"
      ? {
          background: `linear-gradient(135deg, color-mix(in srgb, ${profile.bgColor} 90%, #000 50%) 0%, ${profile.accentColor}45 100%)`,
        }
      : {
          background: `linear-gradient(160deg, color-mix(in srgb, ${profile.bgColor} 60%, #000 40%) 0%, ${profile.accentColor}20 100%)`,
        };

  const linkStyle = isOutline
    ? {
        border: `1px solid ${profile.accentColor}55`,
        background: "transparent",
      }
    : {
        border: `1px solid ${profile.accentColor}28`,
        background: `${profile.accentColor}0d`,
      };

  const repoStyle = {
    border: `1px solid ${profile.accentColor}20`,
    background: `${profile.accentColor}08`,
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
          label: "Siguiendo",
          value: formatCount(githubStats.user.following),
          Icon: UserCheck,
          iconColor: "#60a5fa",
        },
        {
          label: "Stars recibidas",
          value: formatCount(totalStars),
          Icon: Star,
          iconColor: "#facc15",
        },
      ]
    : [];

  const DISPLAY_WEEKS = 28;
  const contributions = githubStats?.contributions ?? [];
  const recentDays = contributions.slice(-(DISPLAY_WEEKS * 7));
  const firstDow =
    recentDays.length > 0 ? (new Date(recentDays[0].date).getDay() + 6) % 7 : 0;
  const paddedDays = [...Array(firstDow).fill(null), ...recentDays];
  const heatmapWeeks: ((typeof recentDays)[0] | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    heatmapWeeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <div
      className="relative mx-auto w-full max-w-[480px] rounded-[30px]"
      style={{
        fontFamily,
        boxShadow:
          "0 12px 48px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {!hideShare && (
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="absolute top-4 right-4 z-30 flex size-10 cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
          style={{
            background: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.10)",
            color: textPrimary,
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          aria-label="Compartir perfil"
        >
          <Share2 className="size-5" />
        </button>
      )}

      <div
        ref={coverRef}
        className="relative w-full overflow-hidden rounded-t-[30px]"
        style={{ height: 400 }}
      >
        <div className="absolute inset-0" style={{ background: cardBg }} />

        <motion.div
          className="absolute inset-0"
          style={{
            ...coverBg,
            opacity: coverOpacity,
            scale: coverScale,
            filter: coverBlurFilter,

            WebkitMaskImage: `linear-gradient(to bottom,
              #000 0%,
              #000 45%,
              rgba(0,0,0,0.92) 55%,
              rgba(0,0,0,0.72) 65%,
              rgba(0,0,0,0.45) 75%,
              rgba(0,0,0,0.18) 85%,
              rgba(0,0,0,0.05) 92%,
              transparent 100%
            )`,
            maskImage: `linear-gradient(to bottom,
              #000 0%,
              #000 45%,
              rgba(0,0,0,0.92) 55%,
              rgba(0,0,0,0.72) 65%,
              rgba(0,0,0,0.45) 75%,
              rgba(0,0,0,0.18) 85%,
              rgba(0,0,0,0.05) 92%,
              transparent 100%
            )`,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, ${profile.bgColor}4d 0%, transparent 22%, transparent 78%, ${profile.bgColor}4d 100%)`,
          }}
        />

        {stickers.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-20">
            {stickers.map((sticker, idx) => {
              const meta = PROGRAMMING_STICKERS.find(
                (s) => s.slug === sticker.id,
              );
              const color = meta?.brandColor ?? profile.accentColor;
              const size = Math.round(56 * (sticker.scale ?? 1));
              return (
                <div
                  key={`${sticker.id}-${idx}`}
                  className="absolute"
                  style={{
                    left: `${sticker.x}%`,
                    top: `${sticker.y}%`,
                    width: size,
                    height: size,
                    marginLeft: -size / 2,
                    marginTop: -size / 2,
                    transform: `rotate(${sticker.rotation}deg)`,
                  }}
                >
                  <div
                    className="absolute rounded-xl bg-white"
                    style={{
                      inset: -5,
                      zIndex: -1,
                      boxShadow: "0 3px 12px rgba(0,0,0,0.28)",
                    }}
                  />
                  <Image
                    src={iconUrl(sticker.id, color)}
                    alt={sticker.id}
                    width={size}
                    height={size}
                    unoptimized
                    className="size-full select-none object-contain"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="px-6 pb-8 pt-0 rounded-b-[30px]"
        style={{ background: cardBg }}
      >
        <div
          className="relative z-10 flex flex-col items-center pb-5 pt-0"
          style={{ marginTop: "-36px" }}
        >
          <div
            className="size-[72px] overflow-hidden rounded-full"
            style={{
              background: profile.avatarUrl
                ? "transparent"
                : `${profile.accentColor}25`,
              boxShadow: `0 0 0 2px ${profile.bgColor}, 0 0 0 4px ${profile.accentColor}80, 0 6px 28px ${profile.accentColor}55, 0 2px 8px rgba(0,0,0,0.25)`,
            }}
          >
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                width={72}
                height={72}
                className="size-full object-cover"
                priority
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <span
                  className="text-base font-bold"
                  style={{ color: textPrimary }}
                >
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <p
            className="mt-2.5 text-[13px] font-semibold"
            style={{ color: textPrimary }}
          >
            {profile.displayName}
          </p>
          <p
            className="mt-0.5 text-[11px]"
            style={{ color: `${profile.accentColor}cc` }}
          >
            @{profile.username}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {profile.location && (
              <span
                className="flex items-center gap-1 text-[11px]"
                style={{ color: textMuted }}
              >
                <MapPin className="size-3 shrink-0" />
                {profile.location}
              </span>
            )}
            <span
              className="flex items-center gap-1 text-[11px]"
              style={{ color: `${profile.accentColor}70` }}
            >
              <Link2 className="size-3 shrink-0" />
              devlinks.io/{profile.username}
            </span>

            <span
              className="max-w-sm text-center text-sm font-semibold"
              style={{ color: textMuted }}
            >
              {profile.bio}
            </span>
          </div>

          {primaryLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-3">
              {primaryLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.title}
                  className="flex size-10 shrink-0 items-center justify-center transition-all hover:opacity-80 hover:scale-110"
                >
                  <Image
                    src={iconUrl(link.icon ?? "link", profile.accentColor)}
                    alt={link.title}
                    width={50}
                    height={50}
                    unoptimized
                    className="size-7 object-contain"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {statsItems.length > 0 && (
          <>
            <div className="mb-4 h-px" style={{ background: dividerColor }} />
            <div className="grid grid-cols-4 gap-2">
              {statsItems.map(({ label, value, Icon, iconColor }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-1"
                  style={{
                    background: `${iconColor}0d`,
                    border: `1px solid ${iconColor}20`,
                  }}
                >
                  <div
                    className="flex items-center justify-center rounded-lg p-1.5"
                    style={{
                      background: `${iconColor}18`,
                    }}
                  >
                    <Icon className="size-4" style={{ color: iconColor }} />
                  </div>
                  <span
                    className="text-[15px] font-bold tabular-nums leading-none"
                    style={{ color: textPrimary }}
                  >
                    {value}
                  </span>
                  <span
                    className="text-center text-[8px] leading-tight"
                    style={{ color: textMuted }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {heatmapWeeks.length > 0 && (
          <>
            <div className="my-4 h-px" style={{ background: dividerColor }} />
            <div className="mb-2.5 flex items-baseline justify-between">
              <span
                className="text-[9px] font-semibold uppercase tracking-widest"
                style={{ color: textMuted }}
              >
                Contribuciones
              </span>
              {githubStats && (
                <span
                  className="text-[9px] tabular-nums"
                  style={{ color: textMuted }}
                >
                  {formatCount(githubStats.totalContributions)} este año
                </span>
              )}
            </div>
            <div className="flex justify-center gap-[3px]">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const day = week[di] ?? null;
                    const level = day?.level ?? -1;
                    return (
                      <div
                        key={di}
                        title={
                          day
                            ? `${day.date}: ${day.count} contributions`
                            : undefined
                        }
                        style={{
                          width: 11,
                          height: 11,
                          borderRadius: 3,
                          background:
                            level < 0
                              ? `${profile.accentColor}0a`
                              : `${profile.accentColor}${HEATMAP_ALPHA[Math.max(0, level)]}`,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-end gap-1.5">
              <span className="text-[8px]" style={{ color: textMuted }}>
                Menos
              </span>
              {["0a", ...HEATMAP_ALPHA].map((alpha) => (
                <div
                  key={alpha}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    background: `${profile.accentColor}${alpha}`,
                  }}
                />
              ))}
              <span className="text-[8px]" style={{ color: textMuted }}>
                Más
              </span>
            </div>
          </>
        )}

        {hasProjects && (
          <>
            <div className="my-4 h-px" style={{ background: dividerColor }} />
            <p
              className="mb-2 text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: textMuted }}
            >
              Proyectos destacados
            </p>
            <div className="grid grid-cols-3 gap-2">
              {projects.map((project, i) => (
                <motion.a
                  key={project.id}
                  href={project.url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col justify-between rounded-lg p-3"
                  style={repoStyle}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: i * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <p
                        className="text-[11px] font-bold leading-tight break-all line-clamp-2"
                        style={{
                          color:
                            PROJECT_TITLE_COLORS[
                              i % PROJECT_TITLE_COLORS.length
                            ],
                        }}
                      >
                        {project.title || project.githubRepo}
                      </p>
                      <ExternalLink
                        className="size-3 shrink-0 mt-0.5"
                        style={{ color: `${profile.accentColor}80` }}
                      />
                    </div>
                    {project.description && (
                      <p
                        className="text-[10px] leading-relaxed line-clamp-2"
                        style={{ color: textMuted }}
                      >
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-1">
                    {project.language ? (
                      <span
                        className="flex items-center gap-1 text-[9px]"
                        style={{ color: textMuted }}
                      >
                        <span
                          className="block size-1.5 rounded-full shrink-0"
                          style={{
                            background:
                              LANG_COLOR[project.language] ??
                              profile.accentColor,
                          }}
                        />
                        {project.language}
                      </span>
                    ) : (
                      <span />
                    )}
                    {project.stars > 0 && (
                      <span
                        className="flex items-center gap-0.5 text-[9px] shrink-0"
                        style={{ color: textMuted }}
                      >
                        <Star className="size-2.5 fill-current" />
                        {project.stars >= 1000
                          ? `${(project.stars / 1000).toFixed(1)}k`
                          : project.stars}
                      </span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          </>
        )}

        {secondaryLinks.length > 0 && (
          <>
            <div className="my-4 h-px" style={{ background: dividerColor }} />
            <p
              className="mb-2 text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: textMuted }}
            >
              Links
            </p>
            <div className="flex flex-col gap-2">
              {secondaryLinks.map((link, i) => {
                const isFeatured =
                  link.layout === "featured" && link.previewImage;
                return (
                  <motion.a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex w-full overflow-hidden",
                      isFeatured
                        ? "flex-col"
                        : "min-h-[52px] items-center gap-3 px-4 py-3",
                    )}
                    style={{
                      borderRadius: buttonRadius,
                      ...(isFeatured
                        ? {
                            border: `1px solid ${profile.accentColor}35`,
                            background: `${profile.accentColor}08`,
                          }
                        : linkStyle),
                    }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: i * 0.05,
                      ease: "easeOut",
                    }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isFeatured && (
                      <Image
                        src={link.previewImage!}
                        alt={link.title}
                        width={480}
                        height={120}
                        className="h-[120px] w-full object-cover"
                        style={{
                          borderTopLeftRadius: buttonRadius,
                          borderTopRightRadius: buttonRadius,
                        }}
                        unoptimized
                      />
                    )}
                    <div
                      className={cn(
                        "flex items-center gap-3",
                        isFeatured && "px-4 py-3",
                      )}
                    >
                      {!isFeatured && link.previewImage ? (
                        <Image
                          src={link.previewImage}
                          alt={link.title}
                          width={40}
                          height={40}
                          unoptimized
                          className="size-10 shrink-0 rounded-md object-cover"
                        />
                      ) : link.icon ? (
                        <Image
                          src={iconUrl(link.icon, profile.accentColor)}
                          alt={link.icon}
                          width={16}
                          height={16}
                          unoptimized
                          className="size-4 shrink-0 object-contain"
                        />
                      ) : null}
                      <span
                        className="flex-1 break-words text-center text-[12px] font-medium leading-snug"
                        style={{ color: textPrimary }}
                      >
                        {link.title}
                      </span>
                      <ChevronRight
                        className="size-4 shrink-0"
                        style={{ color: textMuted }}
                      />
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <span
            className="text-[9px] uppercase tracking-widest"
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
              className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
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
    </div>
  );
}
