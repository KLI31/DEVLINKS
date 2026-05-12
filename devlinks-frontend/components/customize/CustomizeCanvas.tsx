"use client";

import { useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { AlertCircle, Check, Link2, Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import type { AuthUser } from "@/types/auth";
import type { CustomizeValues, SaveStatus } from "../../hooks/useCustomize";
import type { PlacedSticker } from "@/types";
import { iconUrl } from "@/lib/icons";
import { getDevIconUrl } from "@/lib/api/github.api";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";
import { ProfileSticker } from "./ProfileSticker";

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

const MOCK_SOCIAL_SLUGS = ["x", "instagram", "youtube", "discord"];

const MOCK_REPOS = [
  {
    fullName: "KLI31/curso-react",
    description: "Curso de React desde cero a avanzado",
    language: "TypeScript",
  },
  {
    fullName: "KLI31/midfy",
    description: "Librería de componentes React",
    language: "TypeScript",
  },
  {
    fullName: "KLI31/configs",
    description: "Mis configuraciones de desarrollo",
    language: "JavaScript",
  },
];

const MOCK_LINKS = [
  { label: "Portfolio", slug: "dribbble" },
  { label: "Blog", slug: "medium" },
  { label: "npm", slug: "npm" },
];

const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Go: "#00ADD8",
  Rust: "#dea584",
};

function perceivedLuminance(hex: string): number {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

interface CustomizeCanvasProps {
  values: CustomizeValues;
  user: AuthUser | null;
  saveStatus: SaveStatus;
  onUpdateStickers: (stickers: PlacedSticker[]) => void;
}

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  const map = {
    saving: {
      border: "rgba(255,255,255,0.1)",
      bg: "rgba(0,0,0,0.5)",
      color: "rgba(255,255,255,0.55)",
    },
    saved: { border: "#22c55e40", bg: "#22c55e10", color: "#22c55e" },
    error: { border: "#ef444440", bg: "#ef444410", color: "#ef4444" },
  }[status];

  return (
    <div
      className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
      style={{ borderColor: map.border, background: map.bg, color: map.color }}
    >
      {status === "saving" && <Loader2 className="size-3 animate-spin" />}
      {status === "saved" && <Check className="size-3" />}
      {status === "error" && <AlertCircle className="size-3" />}
      {status === "saving"
        ? "Guardando..."
        : status === "saved"
          ? "Guardado"
          : "Error al guardar"}
    </div>
  );
}

export function CustomizeCanvas({
  values,
  user,
  saveStatus,
  onUpdateStickers,
}: CustomizeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: "profile-card-canvas",
  });

  const buttonRadius = BUTTON_RADIUS[values.buttonStyle] ?? "8px";
  const isOutline = IS_OUTLINE[values.buttonStyle] ?? false;
  const fontFamily = FONT_CSS[values.fontFamily] ?? FONT_CSS["jetbrains-mono"];

  const isLight = perceivedLuminance(values.bgColor) > 0.5;
  const textPrimary = isLight ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.92)";
  const textSecond = isLight ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";
  const textMuted = isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.32)";
  const cardBorder = isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)";
  const dividerColor = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
  const cardBaseColor = values.bgColor;

  const hasCoverUrl = Boolean(values.coverImageUrl);

  const coverBg = hasCoverUrl
    ? {
        backgroundImage: `url(${values.coverImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : values.bgType === "gradient"
      ? {
          background: `linear-gradient(135deg, color-mix(in srgb, ${values.bgColor} 90%, #000 50%) 0%, ${values.accentColor}45 100%)`,
        }
      : {
          background: `linear-gradient(160deg, color-mix(in srgb, ${values.bgColor} 60%, #000 40%) 0%, ${values.accentColor}20 100%)`,
        };

  const cardBg =
    values.bgType === "gradient"
      ? `linear-gradient(160deg, ${values.bgColor} 0%, color-mix(in srgb, ${values.bgColor} 75%, ${values.accentColor} 25%) 100%)`
      : values.bgColor;

  const linkStyle = isOutline
    ? { border: `1px solid ${values.accentColor}55`, background: "transparent" }
    : {
        border: `1px solid ${values.accentColor}28`,
        background: `${values.accentColor}0d`,
      };

  const repoStyle = {
    border: `1px solid ${values.accentColor}20`,
    background: `${values.accentColor}08`,
  };

  const socialCircleStyle = {
    border: `1px solid ${values.accentColor}35`,
    background: `${values.accentColor}12`,
  };

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleStickerUpdate = (idx: number, updated: PlacedSticker) => {
    const next = [...values.stickers];
    next[idx] = updated;
    onUpdateStickers(next);
  };

  const handleStickerRemove = (index: number) => {
    const next = values.stickers.filter((_, i) => i !== index);
    onUpdateStickers(next);
    setSelectedIdx(null);
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-muted/10 p-6">
      <SaveBadge status={saveStatus} />

      <div className="relative w-full max-w-[390px] ">
        <div
          ref={(node) => {
            setNodeRef(node);
            (
              containerRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = node;
          }}
          id="profile-card-canvas"
          className="relative w-full overflow-hidden rounded-2xl"
          onPointerDown={(e) => {
            if (!(e.target as HTMLElement).closest("[data-sticker]")) {
              setSelectedIdx(null);
            }
          }}
          style={{
            border: `1px solid ${cardBorder}`,
            fontFamily,
            boxShadow: isOver
              ? `0 0 0 2px ${values.accentColor}80, 0 8px 32px ${values.accentColor}30`
              : undefined,
            transition: "box-shadow 200ms ease",
          }}
        >
          <div className="relative h-60 rounded-t-2xl" style={coverBg}>
            <div
              className="absolute inset-0 z-20 rounded-t-2xl"
              style={{
                background: `linear-gradient(to bottom, transparent 0%, transparent 30%, ${cardBaseColor}00 45%, ${cardBaseColor}88 75%, ${cardBaseColor}ff 100%)`,
              }}
            />
            <div className="absolute -bottom-5 left-4 z-30">
              <div
                className="size-[42px] overflow-hidden rounded-full"
                style={{
                  background: user?.avatarUrl
                    ? "transparent"
                    : `${values.accentColor}25`,
                  boxShadow: `0 0 0 2px ${values.bgColor}, 0 0 0 3.5px ${cardBorder}`,
                }}
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.displayName}
                    width={42}
                    height={42}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <span
                      className="text-sm font-bold"
                      style={{ color: textSecond }}
                    >
                      {initials}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="rounded-b-2xl px-3.5 pb-3.5"
            style={{ background: cardBg, paddingTop: "30px" }}
          >
            <div>
              <p
                className="text-[13px] font-bold leading-tight"
                style={{ color: textPrimary }}
              >
                {user?.displayName ?? "Tu nombre"}
              </p>
              <p
                className="mt-0.5 text-[11px]"
                style={{ color: `${values.accentColor}cc` }}
              >
                @{user?.username ?? "username"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                {user?.location && (
                  <span
                    className="flex items-center gap-1 text-[10px]"
                    style={{ color: textMuted }}
                  >
                    <MapPin className="size-2.5 shrink-0" />
                    {user.location}
                  </span>
                )}
                <span
                  className="flex items-center gap-1 text-[10px]"
                  style={{ color: `${values.accentColor}80` }}
                >
                  <Link2 className="size-2.5 shrink-0" />
                  devlinks.io/{user?.username ?? "username"}
                </span>
              </div>
              {user?.bio && (
                <p
                  className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed"
                  style={{ color: textSecond }}
                >
                  {user.bio}
                </p>
              )}
            </div>

            <div
              className=" flex items-center gap-2 border-b py-2"
              style={{ borderColor: dividerColor }}
            >
              {MOCK_SOCIAL_SLUGS.map((slug) => (
                <div
                  key={slug}
                  className="flex size-[26px] shrink-0 items-center justify-center rounded-full"
                  style={socialCircleStyle}
                >
                  <Image
                    src={iconUrl(slug, values.accentColor)}
                    alt={slug}
                    width={12}
                    height={12}
                    quality={100}
                    unoptimized
                    className="size-[12px] object-contain"
                  />
                </div>
              ))}
            </div>

            <div className="mt-2.5 flex gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                {MOCK_REPOS.map((repo) => {
                  const deviconUrl = getDevIconUrl(repo.language);
                  return (
                    <div
                      key={repo.fullName}
                      className="flex flex-col gap-0.5 rounded-lg px-2.5 py-2"
                      style={repoStyle}
                    >
                      <div className="flex min-w-0 items-center justify-between">
                        <span
                          className="truncate text-[10px] font-semibold"
                          style={{ color: textPrimary }}
                        >
                          {repo.fullName}
                        </span>
                        <span
                          className="flex items-center gap-1 text-[9px]"
                          style={{ color: textMuted }}
                        >
                          {repo.language}
                          {deviconUrl ? (
                            <Image
                              src={deviconUrl}
                              alt={repo.language}
                              width={11}
                              height={11}
                              className="size-[11px] shrink-0 object-contain"
                            />
                          ) : (
                            <span
                              className="size-1.5 rounded-full"
                              style={{
                                background:
                                  LANG_COLOR[repo.language] ??
                                  values.accentColor,
                              }}
                            />
                          )}
                        </span>
                      </div>
                      <p
                        className="truncate text-[9px] leading-relaxed"
                        style={{ color: textMuted }}
                      >
                        {repo.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div
                className="w-px shrink-0"
                style={{ background: dividerColor }}
              />

              <div className="flex w-[96px] shrink-0 flex-col gap-1.5">
                {MOCK_LINKS.map((link) => (
                  <div
                    key={link.label}
                    className="flex items-center gap-1.5 px-2 py-1.5"
                    style={{ borderRadius: buttonRadius, ...linkStyle }}
                  >
                    <Image
                      src={iconUrl(link.slug, values.accentColor)}
                      alt={link.label}
                      width={12}
                      height={12}
                      quality={100}
                      unoptimized
                      className="size-[12px] shrink-0 object-contain"
                    />
                    <span
                      className="truncate text-[10px] font-medium"
                      style={{ color: textPrimary }}
                    >
                      {link.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 z-20 pointer-events-none">
          {values.stickers.map((sticker, idx) => {
            const meta = PROGRAMMING_STICKERS.find(
              (s) => s.slug === sticker.id,
            );
            return (
              <ProfileSticker
                key={`${sticker.id}-${idx}`}
                sticker={sticker}
                index={idx}
                brandColor={meta?.brandColor ?? values.accentColor}
                containerRef={
                  containerRef as React.RefObject<HTMLDivElement | null>
                }
                isSelected={selectedIdx === idx}
                onSelect={(idx: number) => setSelectedIdx(idx)}
                onUpdate={handleStickerUpdate}
                onRemove={handleStickerRemove}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
