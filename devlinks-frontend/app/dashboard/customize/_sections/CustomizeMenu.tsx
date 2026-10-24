"use client";

import type { CSSProperties } from "react";
import { GitBranch, Sparkles } from "lucide-react";
import type { CustomizeValues } from "@/hooks/useCustomize";
import { StickerTile, stickerColor } from "@/components/profile/StickerTile";

interface MenuItem {
  id: string;
  title: string;
  description: string;
  preview: (v: CustomizeValues) => React.ReactNode;
}

const ITEMS: MenuItem[] = [
  {
    id: "profile",
    title: "Perfil",
    description: "Layout y portada",
    preview: (v) => (
      <div className="flex flex-col items-center gap-1.5">
        <div
          className="size-8 rounded-full"
          style={{ background: v.accentColor, boxShadow: `0 0 0 2px ${v.bgColor}, 0 0 0 3.5px ${v.accentColor}80` }}
        />
        <div className="h-1.5 w-12 rounded-full" style={{ background: v.titleColor }} />
        <div className="h-1 w-8 rounded-full opacity-50" style={{ background: v.pageTextColor }} />
      </div>
    ),
  },
  {
    id: "text",
    title: "Texto",
    description: "Fuentes y títulos",
    preview: (v) => (
      <span className="text-3xl font-bold leading-none" style={{ color: v.titleColor }}>
        Aa
      </span>
    ),
  },
  {
    id: "buttons",
    title: "Botones",
    description: "Forma, sombra y color",
    preview: (v) => (
      <div
        className="flex h-8 w-24 items-center justify-center text-[11px] font-semibold"
        style={{
          background: v.buttonVariant === "solid" ? v.buttonColor : "transparent",
          border: v.buttonVariant === "solid" ? "none" : `1.5px solid ${v.buttonColor}`,
          color: v.buttonVariant === "solid" ? v.buttonTextColor : v.buttonColor,
          borderRadius: Math.min(v.buttonRadius, 16),
        }}
      >
        Mi link
      </div>
    ),
  },
  {
    id: "wallpaper",
    title: "Fondo",
    description: "Temas y colores",
    preview: () => null,
  },
  {
    id: "repos",
    title: "Repos",
    description: "Proyectos de GitHub",
    preview: (v) => <GitBranch className="size-8" style={{ color: v.accentColor }} />,
  },
  {
    id: "stickers",
    title: "Stickers",
    description: "Decora tu card",
    preview: (v) =>
      v.stickers.length > 0 ? (
        <StickerTile slug={v.stickers[0].id} color={stickerColor(v.stickers[0].id, v.accentColor)} size={52} className="-rotate-6" />
      ) : (
        <Sparkles className="size-8" style={{ color: v.accentColor }} />
      ),
  },
];

function tileBackground(v: CustomizeValues): CSSProperties {
  return {
    background:
      v.bgType === "gradient"
        ? `linear-gradient(135deg, ${v.bgColor} 0%, ${v.accentColor} 140%)`
        : v.bgColor,
  };
}

interface CustomizeMenuProps {
  values: CustomizeValues;
  onSelect: (section: string) => void;
}

export function CustomizeMenu({ values, onSelect }: CustomizeMenuProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 shrink-0">
        <h2 className="text-base font-semibold text-foreground">Personaliza tu perfil</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Elige qué quieres cambiar. Verás el resultado al instante.
        </p>
      </div>

      <div className="scroll-thin grid flex-1 grid-cols-2 content-start gap-3 overflow-y-auto overscroll-contain pr-1">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="group cursor-pointer rounded-2xl border border-border/60 bg-card p-1.5 text-left transition-[border-color,scale] duration-150 ease-out hover:border-foreground/30 active:scale-[0.96]"
          >
            <div
              className="flex h-24 items-center justify-center overflow-hidden rounded-xl"
              style={tileBackground(values)}
            >
              {item.preview(values)}
            </div>
            <div className="px-1.5 pb-1.5 pt-2.5">
              <p className="text-[13px] font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
