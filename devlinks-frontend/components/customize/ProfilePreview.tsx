"use client";

import Image from "next/image";
import { MapPin, Star, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicProfile, Project, PlacedSticker, LinkItem, GithubStats } from "@/types";
import { iconUrl } from "@/lib/icons";
import { getDevIconUrl } from "@/lib/api/github.api";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";

const LEGACY_BUTTON_RADIUS: Record<string, string> = {
  "rounded-fill": "8px",
  "sharp-fill": "2px",
  "pill-fill": "9999px",
  "rounded-outline": "8px",
  "sharp-outline": "2px",
  "pill-outline": "9999px",
};

const LEGACY_IS_OUTLINE: Record<string, boolean> = {
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

const BUTTON_SHADOW_CSS: Record<string, string> = {
  none: "none",
  soft: "0 2px 8px rgba(0,0,0,0.15)",
  strong: "0 4px 16px rgba(0,0,0,0.25)",
  hard: "0 6px 24px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2)",
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
  "#60a5fa", "#34d399", "#a78bfa", "#f472b6", "#fb923c",
  "#22d3ee", "#4ade80", "#e879f9",
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

interface ProfilePreviewProps {
  profile: PublicProfile;
  projects: Project[];
  links: LinkItem[];
  githubStats?: GithubStats | null;
  layout?: "classic" | "hero";
}

export function ProfilePreview({
  profile,
  projects,
  links,
  githubStats,
  layout = "classic",
}: ProfilePreviewProps) {
  const isLight = perceivedLuminance(profile.bgColor) > 0.5;
  const isGradient = profile.bgType === "gradient";
  const textPrimary = isLight ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.92)";
  const textMuted = isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.32)";
  const textSecondary = isLight ? "rgba(0,0,0,0.58)" : "rgba(255,255,255,0.62)";
  const dividerColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  const fontFamily = FONT_CSS[profile.fontFamily] ?? FONT_CSS["jetbrains-mono"];
  const titleFontFamily = profile.altTitleFont
    ? (FONT_CSS[(profile as unknown as Record<string, string>).titleFont] ?? FONT_CSS["playfair"])
    : fontFamily;

  const effectiveButtonVariant =
    profile.buttonVariant ||
    (LEGACY_IS_OUTLINE[profile.buttonStyle] ? "outline" : "solid");
  const effectiveButtonRadius =
    typeof profile.buttonRadius === "number"
      ? profile.buttonRadius
      : parseInt(LEGACY_BUTTON_RADIUS[profile.buttonStyle] ?? "8px", 10);
  const effectiveButtonColor = profile.buttonColor || profile.accentColor;
  const buttonRadius = `${effectiveButtonRadius}px`;

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

  const buttonShadow = BUTTON_SHADOW_CSS[profile.buttonShadow] ?? "none";

  const linkStyle =
    effectiveButtonVariant === "outline"
      ? {
          border: `1px solid ${effectiveButtonColor}55`,
          background: "transparent",
          boxShadow: buttonShadow,
        }
      : effectiveButtonVariant === "glass"
        ? {
            border: `1px solid ${effectiveButtonColor}30`,
            background: `${effectiveButtonColor}18`,
            backdropFilter: "blur(4px)",
            boxShadow: buttonShadow,
          }
        : {
            border: `1px solid ${effectiveButtonColor}28`,
            background: `${effectiveButtonColor}0d`,
            boxShadow: buttonShadow,
          };

  const repoStyle = {
    border: `1px solid ${profile.accentColor}20`,
    background: `${profile.accentColor}08`,
  };

  const stickers: PlacedSticker[] = Array.isArray(profile.stickers)
    ? profile.stickers
    : [];

  const sortedLinks = [...links].sort((a, b) => a.displayOrder - b.displayOrder);
  const primaryLinks = sortedLinks.filter((link) => link.isPrimary);
  const secondaryLinks = sortedLinks.filter((l) => !l.isPrimary);
  const hasProjects = projects.length > 0;

  const totalStars =
    githubStats?.topRepos.reduce((s, r) => s + r.stargazers_count, 0) ?? 0;

  const statsItems = githubStats
    ? [
        { label: "Repos", value: formatCount(githubStats.totalRepos) },
        { label: "Seguidores", value: formatCount(githubStats.followers) },
        { label: "Siguiendo", value: formatCount(githubStats.user.following) },
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
      className="relative mx-auto w-full"
      style={{ maxWidth: 390, fontFamily }}
    >
      <div
        className="relative w-full overflow-hidden rounded-[24px]"
        style={{
          border: `1px solid ${isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)"}`,
          boxShadow:
            "0 12px 48px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.03)",
          background: isGradient ? cardBg : undefined,
        }}
      >
        {/* Cover / Header area */}
        {layout === "hero" ? (
          <div
            className="relative h-52 w-full rounded-t-[24px]"
            style={{
              ...coverBg,
              ...(isGradient && {
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 42%, transparent 90%)",
                maskImage: "linear-gradient(to bottom, black 0%, black 42%, transparent 90%)",
              }),
            }}
          >
            {!isGradient && (
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, transparent 0%, transparent 42%, ${profile.bgColor}00 56%, ${profile.bgColor}bb 78%, ${profile.bgColor} 100%)`,
                }}
              />
            )}
          </div>
        ) : null}

        {/* Hero avatar */}
        {layout === "hero" && (
          <div className="absolute left-1/2 z-20 -translate-x-1/2" style={{ top: 172 }}>
            <div
              className="size-[76px] overflow-hidden rounded-full"
              style={{
                background: profile.avatarUrl ? "transparent" : `${profile.accentColor}25`,
                boxShadow: `0 0 0 3px ${profile.bgColor}, 0 0 0 5px ${profile.accentColor}80, 0 6px 28px ${profile.accentColor}55`,
              }}
            >
              {profile.avatarUrl ? (
                <Image src={profile.avatarUrl} alt={profile.displayName} width={76} height={76} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="text-lg font-bold" style={{ color: textPrimary }}>
                    {profile.displayName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="px-6 pb-7 pt-5" style={{ background: isGradient ? "transparent" : cardBg }}>
          {/* Avatar for Classic */}
          {layout === "classic" && (
            <div className="mb-4 flex justify-center">
              <div
                className="size-[76px] overflow-hidden rounded-full"
                style={{
                  background: profile.avatarUrl ? "transparent" : `${profile.accentColor}25`,
                  boxShadow: `0 0 0 3px ${profile.bgColor}, 0 0 0 5px ${profile.accentColor}80, 0 6px 28px ${profile.accentColor}55`,
                }}
              >
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt={profile.displayName} width={76} height={76} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <span className="text-lg font-bold" style={{ color: textPrimary }}>
                      {profile.displayName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info */}
          <div className={layout === "hero" ? "pt-10" : ""}>
            <p
              className="text-center text-[17px] font-bold leading-tight"
              style={{ color: profile.titleColor || textPrimary, fontFamily: titleFontFamily }}
            >
              {profile.displayName}
            </p>
            <p className="mt-1 text-center text-[13px]" style={{ color: `${profile.accentColor}cc` }}>
              @{profile.username}
            </p>

            {profile.location && (
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" style={{ color: textSecondary }} />
                <span className="text-[12px]" style={{ color: textSecondary }}>
                  {profile.location}
                </span>
              </div>
            )}

            {profile.bio && (
              <p className="mt-2.5 text-center text-[13px] leading-relaxed" style={{ color: textSecondary }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Primary Links (social icons) */}
          {primaryLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {primaryLinks.map((link) => (
                <div key={link.id} title={link.title} className="flex size-11 shrink-0 items-center justify-center">
                  <Image
                    src={iconUrl(link.icon ?? "link", profile.accentColor)}
                    alt={link.title}
                    width={32}
                    height={32}
                    unoptimized
                    className="size-8 object-contain"
                  />
                </div>
              ))}
            </div>
          )}

          {/* GitHub Stats */}
          {statsItems.length > 0 && (
            <>
              <div className="my-4 h-px" style={{ background: dividerColor }} />
              <div className="grid grid-cols-4 gap-2">
                {statsItems.map(({ label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-1" style={repoStyle}>
                    <span className="text-[15px] font-bold tabular-nums" style={{ color: textPrimary }}>
                      {value}
                    </span>
                    <span className="text-center text-[9px] leading-tight" style={{ color: textMuted }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Heatmap */}
          {heatmapWeeks.length > 0 && (
            <>
              <div className="my-4 h-px" style={{ background: dividerColor }} />
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                  Contribuciones
                </span>
                {githubStats && (
                  <span className="text-[10px] tabular-nums" style={{ color: textMuted }}>
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
                          style={{
                            width: 13,
                            height: 13,
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
              <div className="mt-2 flex items-center justify-end gap-1">
                <span className="text-[9px]" style={{ color: textMuted }}>Menos</span>
                {["0a", ...HEATMAP_ALPHA].map((alpha) => (
                  <div key={alpha} style={{ width: 10, height: 10, borderRadius: 2, background: `${profile.accentColor}${alpha}` }} />
                ))}
                <span className="text-[9px]" style={{ color: textMuted }}>Más</span>
              </div>
            </>
          )}

          {/* Projects */}
          {hasProjects && (
            <>
              <div className="my-4 h-px" style={{ background: dividerColor }} />
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                Proyectos destacados
              </p>
              <div className="grid grid-cols-1 gap-2">
                {projects.slice(0, 3).map((project, i) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-1 rounded-xl px-4 py-3"
                    style={repoStyle}
                  >
                    <div className="flex min-w-0 items-center justify-between">
                      <span className="truncate text-[13px] font-bold" style={{ color: PROJECT_TITLE_COLORS[i % PROJECT_TITLE_COLORS.length] }}>
                        {project.title || project.githubRepo}
                      </span>
                      {project.language && (
                        <span className="flex items-center gap-1 text-[10px]" style={{ color: textMuted }}>
                          {project.language}
                          <span
                            className="size-2 rounded-full"
                            style={{ background: LANG_COLOR[project.language] ?? profile.accentColor }}
                          />
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="truncate text-[11px] leading-relaxed" style={{ color: textMuted }}>
                        {project.description}
                      </p>
                    )}
                    {project.stars > 0 && (
                      <span className="flex items-center gap-1 text-[10px]" style={{ color: textMuted }}>
                        <Star className="size-3 fill-current" />
                        {project.stars >= 1000 ? `${(project.stars / 1000).toFixed(1)}k` : project.stars}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Secondary Links */}
          {secondaryLinks.length > 0 && (
            <>
              <div className="my-4 h-px" style={{ background: dividerColor }} />
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: textMuted }}>
                Links
              </p>
              <div className="flex flex-col gap-2">
                {secondaryLinks.map((link) => {
                  const isFeatured = link.layout === "featured" && link.previewImage;
                  return (
                    <div
                      key={link.id}
                      className={cn(
                        "flex w-full overflow-hidden",
                        isFeatured ? "flex-col" : "min-h-[48px] items-center gap-3 px-4 py-2.5",
                      )}
                      style={{
                        borderRadius: buttonRadius,
                        ...(isFeatured
                          ? { border: `1px solid ${profile.accentColor}35`, background: `${profile.accentColor}08` }
                          : linkStyle),
                      }}
                    >
                      {isFeatured && link.previewImage && (
                        <div
                          className="h-[90px] w-full bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${link.previewImage})`,
                            borderTopLeftRadius: buttonRadius,
                            borderTopRightRadius: buttonRadius,
                          }}
                        />
                      )}
                      <div className={cn("flex w-full items-center gap-3", isFeatured && "px-4 py-2.5")}>
                        {!isFeatured && link.icon ? (
                          <Image
                            src={iconUrl(link.icon, profile.accentColor)}
                            alt={link.icon}
                            width={20}
                            height={20}
                            unoptimized
                            className="size-5 shrink-0 object-contain"
                          />
                        ) : null}
                        <span className="flex-1 truncate text-center text-[13px] font-medium" style={{ color: textPrimary }}>
                          {link.title}
                        </span>
                        <ChevronRight className="size-4 shrink-0" style={{ color: textMuted }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <span className="text-[9px] uppercase tracking-widest" style={{ color: textMuted }}>
              Creado por{" "}
              <Image src="/logo.svg" alt="DevLinks" width={12} height={12} className="mx-0.5 inline-block" />
              DevLinks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
