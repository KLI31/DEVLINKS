"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";
import { StickerItem } from "@/components/customize/StickerItem";
import { STICKER_MAX } from "@/components/profile/StickerTile";

interface StickersFloatingPanelProps {
  placedCount: number;
  animationEnabled: boolean;
  onToggleAnimation: (enabled: boolean) => void;
}

export function StickersFloatingPanel({
  placedCount,
  animationEnabled,
  onToggleAnimation,
}: StickersFloatingPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? PROGRAMMING_STICKERS.filter((s) =>
        s.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : PROGRAMMING_STICKERS;

  const isFull = placedCount >= STICKER_MAX;

  if (isCollapsed) {
    return (
      <button
        type="button"
        onClick={() => setIsCollapsed(false)}
        className="absolute right-4 top-4 z-30 flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-[13px] font-medium text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.3)] transition-[background-color,scale] duration-150 ease-out hover:bg-muted active:scale-[0.96]"
        aria-label="Mostrar stickers"
      >
        <PanelRightOpen className="size-4 text-muted-foreground" />
        Stickers
        <span className="tabular-nums text-muted-foreground">
          {placedCount}/{STICKER_MAX}
        </span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Stickers"
      className="absolute bottom-4 right-4 top-4 z-30 flex w-[264px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.3)]"
    >
      <header className="flex items-center justify-between gap-2 px-4 pb-3 pt-4">
        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-foreground">
            Stickers
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Arrastra al canvas · máx. {STICKER_MAX}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          aria-label="Ocultar panel"
        >
          <PanelRightClose className="size-4" />
        </button>
      </header>

      <div className="space-y-3 px-4 pb-3">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
            <span className="text-muted-foreground">Colocados</span>
            <span
              className={
                isFull
                  ? "font-medium tabular-nums text-error"
                  : "tabular-nums text-foreground"
              }
            >
              {placedCount}/{STICKER_MAX}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={STICKER_MAX}
            aria-valuenow={placedCount}
            aria-label="Stickers colocados"
            className="h-1 overflow-hidden rounded-full bg-muted"
          >
            <div
              className={
                isFull
                  ? "h-full rounded-full bg-error transition-[width] duration-300 ease-out"
                  : "h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
              }
              style={{ width: `${(placedCount / STICKER_MAX) * 100}%` }}
            />
          </div>
          {isFull && (
            <p className="mt-1.5 text-[11px] text-error">
              Límite alcanzado. Quita uno para agregar otro.
            </p>
          )}
        </div>

        <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2">
          <span className="min-w-0">
            <span className="block text-[12px] font-medium text-foreground">
              Animación flotante
            </span>
            <span className="block text-[11px] text-muted-foreground">
              {placedCount === 0
                ? "Agrega stickers para animarlos"
                : "Movimiento sutil en tu perfil"}
            </span>
          </span>
          <Switch
            checked={animationEnabled}
            onCheckedChange={onToggleAnimation}
            disabled={placedCount === 0}
            aria-label="Animación flotante"
          />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tecnología"
            aria-label="Buscar sticker"
            className="h-9 pl-8 text-[12px]"
          />
        </div>
      </div>

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border px-2 py-2">
        {filtered.length === 0 ? (
          <p className="px-2 py-8 text-center text-[12px] text-muted-foreground">
            Ningún sticker coincide con «{query.trim()}»
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {filtered.map((sticker) => (
              <StickerItem
                key={sticker.slug}
                sticker={sticker}
                disabled={isFull}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
