"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { MapPin, Link2, Star, ChevronRight } from "lucide-react";
import type {
  PublicProfile,
  Project,
  PlacedSticker,
  GithubStats,
} from "@/types";
import { iconUrl, isSocialIcon } from "@/lib/icons";
import { getDevIconUrl } from "@/lib/api/github.api";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";

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
}

export function PublicProfileCard({
  profile,
  projects,
  githubStats,
}: PublicProfileCardProps) {
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
  const socialLinks = sortedLinks.filter((l) => l.icon && isSocialIcon(l.icon));
  const regularLinks = sortedLinks.filter(
    (l) => !l.icon || !isSocialIcon(l.icon),
  );
  const hasProjects = projects.length > 0;

  const totalStars =
    githubStats?.topRepos.reduce((s, r) => s + r.stargazers_count, 0) ?? 0;
  const statsItems = githubStats
    ? [
        { label: "Repos", value: formatCount(githubStats.totalRepos) },
        { label: "Followers", value: formatCount(githubStats.followers) },
        { label: "Following", value: formatCount(githubStats.user.following) },
        { label: "Stars", value: formatCount(totalStars) },
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
      className="relative mx-auto w-full max-w-[480px]"
      style={{ fontFamily }}
    >
      <div
        className="relative w-full overflow-hidden rounded-t-[30px]"
        style={{ height: 400, ...coverBg }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 40%, ${profile.bgColor}cc 72%, ${profile.bgColor}ff 100%)`,
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

      <div className="px-6 pb-8 pt-0" style={{ background: cardBg }}>
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
          </div>

          {socialLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.title}
                  className="flex size-[34px] shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-75"
                  style={{
                    border: `1px solid ${profile.accentColor}35`,
                    background: `${profile.accentColor}12`,
                  }}
                >
                  <Image
                    src={iconUrl(link.icon!, profile.accentColor)}
                    alt={link.title}
                    width={16}
                    height={16}
                    unoptimized
                    className="size-4 object-contain"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        {statsItems.length > 0 && (
          <>
            <div className="mb-4 h-px" style={{ background: dividerColor }} />
            <div
              className="flex overflow-hidden rounded-xl"
              style={{
                background: `${profile.accentColor}0a`,
                border: `1px solid ${profile.accentColor}18`,
              }}
            >
              {statsItems.map(({ label, value }, i) => (
                <div
                  key={label}
                  className="flex flex-1 flex-col items-center gap-0.5 py-3.5"
                  style={
                    i > 0
                      ? { borderLeft: `1px solid ${profile.accentColor}18` }
                      : undefined
                  }
                >
                  <span
                    className="text-[14px] font-bold tabular-nums leading-none"
                    style={{ color: textPrimary }}
                  >
                    {value}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-wide"
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
            <div className="flex flex-col gap-2">
              {projects.map((project, i) => {
                const deviconUrl = project.language
                  ? getDevIconUrl(project.language)
                  : null;
                return (
                  <motion.a
                    key={project.id}
                    href={project.url ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[52px] w-full items-center gap-3 rounded-lg px-4 py-3"
                    style={repoStyle}
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
                    {project.language && (
                      <div className="shrink-0">
                        {deviconUrl ? (
                          <Image
                            src={deviconUrl}
                            alt={project.language}
                            width={16}
                            height={16}
                            unoptimized
                            className="size-4 object-contain"
                          />
                        ) : (
                          <span
                            className="block size-2 rounded-full"
                            style={{
                              background:
                                LANG_COLOR[project.language] ??
                                profile.accentColor,
                            }}
                          />
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[12px] font-semibold leading-tight"
                        style={{ color: textPrimary }}
                      >
                        {project.title || project.githubRepo}
                      </p>
                      {project.description && (
                        <p
                          className="mt-0.5 truncate text-[10px] leading-relaxed"
                          style={{ color: textMuted }}
                        >
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {project.language && (
                        <span
                          className="rounded px-1.5 py-0.5 text-[9px] font-medium"
                          style={{
                            background: `${profile.accentColor}15`,
                            color: `${profile.accentColor}bb`,
                            border: `1px solid ${profile.accentColor}20`,
                          }}
                        >
                          {project.language}
                        </span>
                      )}
                      {project.stars > 0 && (
                        <span
                          className="flex items-center gap-0.5 text-[9px]"
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
                );
              })}
            </div>
          </>
        )}

        {regularLinks.length > 0 && (
          <>
            <div className="my-4 h-px" style={{ background: dividerColor }} />
            <p
              className="mb-2 text-[9px] font-semibold uppercase tracking-widest"
              style={{ color: textMuted }}
            >
              Links
            </p>
            <div className="flex flex-col gap-2">
              {regularLinks.map((link, i) => (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3"
                  style={{ borderRadius: buttonRadius, ...linkStyle }}
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
                  {link.icon && (
                    <Image
                      src={iconUrl(link.icon, profile.accentColor)}
                      alt={link.icon}
                      width={16}
                      height={16}
                      unoptimized
                      className="size-4 shrink-0 object-contain"
                    />
                  )}
                  <span
                    className="flex-1 truncate text-[12px] font-medium"
                    style={{ color: textPrimary }}
                  >
                    {link.title}
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0"
                    style={{ color: textMuted }}
                  />
                </motion.a>
              ))}
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
    </div>
  );
}
