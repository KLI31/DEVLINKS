"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { MapPin, Link2, RotateCw } from "lucide-react";
import type { PublicProfile, Project, PlacedSticker } from "@/types";
import { iconUrl, isSocialIcon } from "@/lib/icons";
import { getDevIconUrl } from "@/lib/api/github.api";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";
import ProfileCard from "@/components/ui/ProfileCard";

const BUTTON_RADIUS: Record<string, string> = {
  "rounded-fill":    "8px",
  "sharp-fill":      "2px",
  "pill-fill":       "9999px",
  "rounded-outline": "8px",
  "sharp-outline":   "2px",
  "pill-outline":    "9999px",
};

const IS_OUTLINE: Record<string, boolean> = {
  "rounded-outline": true,
  "sharp-outline":   true,
  "pill-outline":    true,
};

const FONT_CSS: Record<string, string> = {
  "jetbrains-mono": "'JetBrains Mono', monospace",
  "fira-code":      "'Fira Code', monospace",
  mono:             "ui-monospace, monospace",
  inter:            "'Inter', sans-serif",
  poppins:          "'Poppins', sans-serif",
  "space-grotesk":  "'Space Grotesk', sans-serif",
  outfit:           "'Outfit', sans-serif",
  "dm-sans":        "'DM Sans', sans-serif",
  playfair:         "'Playfair Display', serif",
  fraunces:         "'Fraunces', serif",
};

const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go:         "#00ADD8",
  Rust:       "#dea584",
  Python:     "#3776AB",
  Ruby:       "#CC342D",
  Java:       "#b07219",
  "C#":       "#178600",
  "C++":      "#f34b7d",
  Swift:      "#F05138",
  Kotlin:     "#A97BFF",
};

function perceivedLuminance(hex: string): number {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

interface PublicProfileCardProps {
  profile: PublicProfile;
  projects: Project[];
}

export function PublicProfileCard({ profile, projects }: PublicProfileCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = useCallback(() => setIsFlipped((v) => !v), []);

  const isLight       = perceivedLuminance(profile.bgColor) > 0.5;
  const textPrimary   = isLight ? "rgba(0,0,0,0.88)"  : "rgba(255,255,255,0.92)";
  const textSecond    = isLight ? "rgba(0,0,0,0.55)"  : "rgba(255,255,255,0.55)";
  const textMuted     = isLight ? "rgba(0,0,0,0.35)"  : "rgba(255,255,255,0.32)";
  const cardBorder    = isLight ? "rgba(0,0,0,0.08)"  : "rgba(255,255,255,0.07)";
  const dividerColor  = isLight ? "rgba(0,0,0,0.06)"  : "rgba(255,255,255,0.06)";

  const fontFamily   = FONT_CSS[profile.fontFamily]       ?? FONT_CSS["jetbrains-mono"];
  const buttonRadius = BUTTON_RADIUS[profile.buttonStyle] ?? "8px";
  const isOutline    = IS_OUTLINE[profile.buttonStyle]    ?? false;

  const cardBg = profile.bgType === "gradient"
    ? `linear-gradient(160deg, ${profile.bgColor} 0%, color-mix(in srgb, ${profile.bgColor} 75%, ${profile.accentColor} 25%) 100%)`
    : profile.bgColor;

  const hasCoverUrl = Boolean(profile.coverImageUrl);
  const coverBg = hasCoverUrl
    ? { backgroundImage: `url(${profile.coverImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : profile.bgType === "gradient"
      ? { background: `linear-gradient(135deg, color-mix(in srgb, ${profile.bgColor} 90%, #000 50%) 0%, ${profile.accentColor}45 100%)` }
      : { background: `linear-gradient(160deg, color-mix(in srgb, ${profile.bgColor} 60%, #000 40%) 0%, ${profile.accentColor}20 100%)` };

  const linkStyle = isOutline
    ? { border: `1px solid ${profile.accentColor}55`, background: "transparent" }
    : { border: `1px solid ${profile.accentColor}28`, background: `${profile.accentColor}0d` };

  const repoStyle = {
    border:     `1px solid ${profile.accentColor}20`,
    background: `${profile.accentColor}08`,
  };

  const socialCircleStyle = {
    border:     `1px solid ${profile.accentColor}35`,
    background: `${profile.accentColor}12`,
  };

  const stickers: PlacedSticker[] = Array.isArray(profile.stickers) ? profile.stickers : [];
  const sortedLinks  = [...profile.links].sort((a, b) => a.displayOrder - b.displayOrder);
  const socialLinks  = sortedLinks.filter((l) => l.icon && isSocialIcon(l.icon));
  const regularLinks = sortedLinks.filter((l) => !l.icon || !isSocialIcon(l.icon));
  const hasProjects  = projects.length > 0;
  const hasBothCols  = regularLinks.length > 0 && hasProjects;

  return (
    <div
      className="relative mx-auto w-full max-w-[400px]"
      style={{ perspective: "1200px", fontFamily }}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d", display: "grid" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 55, damping: 12, mass: 0.9 }}
      >

        {/* ── FRENTE: React Bits holographic card ────────── */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            gridArea: "1/1",
          }}
        >
          <div className="relative cursor-pointer" onClick={handleFlip}>
            <ProfileCard
              avatarUrl={profile.avatarUrl ?? undefined}
              miniAvatarUrl={profile.avatarUrl ?? undefined}
              name={profile.displayName}
              title={profile.bio ?? undefined}
              handle={profile.username}
              status={profile.location ?? "En línea"}
              showUserInfo
              showContactButton={false}
              innerGradient={`linear-gradient(145deg, ${profile.bgColor}8c 0%, ${profile.accentColor}44 100%)`}
              behindGlowColor={`${profile.accentColor}aa`}
              className="w-full"
            />
          </div>
        </div>

        {/* ── DORSO: info card completa ───────────────────── */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            gridArea: "1/1",
          }}
        >
          {/* wrapper relativo para posicionar stickers fuera del overflow-hidden */}
          <div className="relative">
          <div
            className="overflow-hidden rounded-[30px]"
            style={{ border: `1px solid ${cardBorder}` }}
          >
            {/* Cover */}
            <div className="relative h-[80px]" style={coverBg}>
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, transparent 0%, transparent 55%, ${profile.bgColor}28 78%, ${profile.bgColor}cc 92%, ${profile.bgColor}ff 100%)`,
                }}
              />
              {/* Avatar */}
              <div className="absolute -bottom-6 left-5 z-10">
                <div
                  className="size-[52px] overflow-hidden rounded-full"
                  style={{
                    background: profile.avatarUrl ? "transparent" : `${profile.accentColor}25`,
                    boxShadow: `0 0 0 3px ${profile.bgColor}, 0 0 0 4px ${cardBorder}`,
                  }}
                >
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      width={52}
                      height={52}
                      className="size-full object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <span className="text-sm font-bold" style={{ color: textSecond }}>
                        {profile.displayName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 pb-5" style={{ background: cardBg, paddingTop: "34px" }}>

              {/* Identity */}
              <div>
                <p className="text-[15px] font-bold leading-tight" style={{ color: textPrimary }}>
                  {profile.displayName}
                </p>
                <p className="mt-0.5 text-[12px]" style={{ color: `${profile.accentColor}cc` }}>
                  @{profile.username}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: textMuted }}>
                      <MapPin className="size-3 shrink-0" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: `${profile.accentColor}80` }}>
                    <Link2 className="size-3 shrink-0" />
                    devlinks.io/{profile.username}
                  </span>
                </div>
                {profile.bio && (
                  <p className="mt-2 text-[12px] leading-relaxed" style={{ color: textSecond }}>
                    {profile.bio}
                  </p>
                )}

                {/* Links sociales como íconos debajo de la bio */}
                {socialLinks.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link.title}
                        className="flex size-[32px] shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-75"
                        style={socialCircleStyle}
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

              {/* Repos + links regulares */}
              {(regularLinks.length > 0 || hasProjects) && (
                <>
                  <div className="my-3.5 h-px" style={{ background: dividerColor }} />
                  <div className="flex gap-2.5">

                    {/* Repos — izquierda */}
                    {hasProjects && (
                      <div className={`flex min-w-0 flex-col gap-1.5 ${hasBothCols ? "flex-1" : "w-full"}`}>
                        {projects.map((project) => {
                          const deviconUrl = project.language ? getDevIconUrl(project.language) : null;
                          return (
                            <a
                              key={project.id}
                              href={project.url ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex flex-col gap-0.5 rounded-lg px-2.5 py-2 transition-opacity hover:opacity-75"
                              style={repoStyle}
                            >
                              <div className="flex min-w-0 items-center justify-between gap-1">
                                <span className="truncate text-[11px] font-semibold" style={{ color: textPrimary }}>
                                  {project.title || project.githubRepo}
                                </span>
                                {project.language && (
                                  <span className="flex shrink-0 items-center gap-1 text-[9px]" style={{ color: textMuted }}>
                                    {deviconUrl ? (
                                      <Image src={deviconUrl} alt={project.language} width={11} height={11} unoptimized className="size-[11px] shrink-0 object-contain" />
                                    ) : (
                                      <span className="size-1.5 rounded-full" style={{ background: LANG_COLOR[project.language] ?? profile.accentColor }} />
                                    )}
                                  </span>
                                )}
                              </div>
                              {project.description && (
                                <p className="truncate text-[9px] leading-relaxed" style={{ color: textMuted }}>
                                  {project.description}
                                </p>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {hasBothCols && (
                      <div className="w-px shrink-0 self-stretch" style={{ background: dividerColor }} />
                    )}

                    {/* Links regulares — derecha */}
                    {regularLinks.length > 0 && (
                      <div className={`flex flex-col gap-1.5 ${hasBothCols ? "w-[110px] shrink-0" : "w-full"}`}>
                        {regularLinks.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex min-h-[30px] items-center gap-1.5 px-2 py-1.5 transition-opacity hover:opacity-75"
                            style={{ borderRadius: buttonRadius, ...linkStyle }}
                          >
                            {link.icon && (
                              <Image
                                src={iconUrl(link.icon, profile.accentColor)}
                                alt={link.icon}
                                width={12}
                                height={12}
                                unoptimized
                                className="size-3 shrink-0 object-contain"
                              />
                            )}
                            <span className="truncate text-[10px] font-medium" style={{ color: textPrimary }}>
                              {link.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

            {/* Stickers sobre el dorso — fuera del overflow-hidden */}
            {stickers.length > 0 && (
              <div className="pointer-events-none absolute inset-0 z-20">
                {stickers.map((sticker, idx) => {
                  const meta  = PROGRAMMING_STICKERS.find((s) => s.slug === sticker.id);
                  const color = meta?.brandColor ?? profile.accentColor;
                  const size  = Math.round(56 * (sticker.scale ?? 1));
                  return (
                    <div
                      key={`${sticker.id}-${idx}`}
                      className="absolute"
                      style={{
                        left:       `${sticker.x}%`,
                        top:        `${sticker.y}%`,
                        width:      size,
                        height:     size,
                        marginLeft: -size / 2,
                        marginTop:  -size / 2,
                        transform:  `rotate(${sticker.rotation}deg)`,
                      }}
                    >
                      <div
                        className="absolute rounded-xl bg-white"
                        style={{ inset: -5, zIndex: -1, boxShadow: "0 3px 12px rgba(0,0,0,0.28)" }}
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
        </div>
      </motion.div>

      {/* Botón flip — centrado abajo */}
      <button
        onClick={handleFlip}
        aria-label={isFlipped ? "Ver perfil" : "Ver información completa"}
        className="absolute bottom-4 left-1/2 z-30 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm transition-all hover:border-white/40 hover:bg-black/60"
      >
        <RotateCw className="size-4 text-white/70" />
      </button>
    </div>
  );
}
