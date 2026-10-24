import { useId } from "react";
import { iconUrl } from "@/lib/icons";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";
import { cn } from "@/lib/utils";
import type { PlacedSticker } from "@/types";

export const STICKER_BASE_SIZE = 72;
export const STICKER_MAX = 8;
export const STICKER_SCALE = { min: 0.6, max: 1.8 } as const;
// Órbita alrededor de la card (% de su tamaño): evita stickers recortados en los bordes del viewport.
export const STICKER_BOUNDS = { x: [-35, 135], y: [-4, 104] } as const;

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export function clampSticker(s: PlacedSticker): PlacedSticker {
  return {
    ...s,
    x: clamp(s.x, ...STICKER_BOUNDS.x),
    y: clamp(s.y, ...STICKER_BOUNDS.y),
    scale: clamp(s.scale ?? 1, STICKER_SCALE.min, STICKER_SCALE.max),
  };
}

export function stickerColor(slug: string, fallback: string): string {
  return PROGRAMMING_STICKERS.find((s) => s.slug === slug)?.brandColor ?? fallback;
}

const FOIL = [
  "#e9eef5", "#8eeefc", "#6fe0cf", "#f3a6fa", "#bba8ff", "#98efba", "#ffcf8a", "#fbe8b0", "#f7f9fc",
];

interface StickerTileProps {
  slug: string;
  color: string;
  size: number;
  className?: string;
  lifted?: boolean;
  live?: boolean;
  delay?: number;
}

export function StickerTile({
  slug,
  color,
  size,
  className,
  lifted,
  live,
  delay = 0,
}: StickerTileProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${name}-${uid}`;
  const url = (name: string) => `url(#${id(name)})`;

  // Troquel: dilata la silueta del logo y suaviza las esquinas
  const die = (name: string, radius: number) => (
    <filter id={id(name)} x="-40%" y="-40%" width="180%" height="180%">
      <feMorphology in="SourceAlpha" operator="dilate" radius={radius} />
      <feGaussianBlur stdDeviation="1.4" />
      <feComponentTransfer result="shape">
        <feFuncA type="linear" slope="5" intercept="-1.5" />
      </feComponentTransfer>
      <feFlood floodColor="#fff" />
      <feComposite in2="shape" operator="in" />
    </filter>
  );

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden
      className={cn("holo-tile select-none overflow-visible", live && "holo-live", className)}
      style={{
        ["--d" as string]: `${delay}s`,
        filter: lifted
          ? "drop-shadow(0 2px 3px rgb(0 0 0 / 0.2)) drop-shadow(0 14px 14px rgb(0 0 0 / 0.3))"
          : "drop-shadow(0 1px 2px rgb(0 0 0 / 0.25)) drop-shadow(0 6px 8px rgb(0 0 0 / 0.22))",
      }}
    >
      <defs>
        <linearGradient id={id("foil")} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="48" y2="48" spreadMethod="reflect">
          {FOIL.map((c, i) => (
            <stop key={c + i} offset={i / (FOIL.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={id("glare")} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        {die("rim", 5.5)}
        {die("core", 3)}
        <mask id={id("rimMask")} maskUnits="userSpaceOnUse" x="0" y="0" width="48" height="48">
          <image href={iconUrl(slug, "ffffff")} x="10" y="10" width="28" height="28" filter={url("rim")} />
        </mask>
      </defs>
      <g mask={url("rimMask")}>
        <rect className="holo-foil" x="-48" width="144" height="48" fill={url("foil")} />
        <rect className="holo-glare" x="-14" y="-10" width="10" height="70" fill={url("glare")} transform="rotate(25 24 24)" opacity="0.7" />
      </g>
      <image href={iconUrl(slug, "ffffff")} x="10" y="10" width="28" height="28" filter={url("core")} />
      <image href={iconUrl(slug, color)} x="10" y="10" width="28" height="28" />
    </svg>
  );
}
