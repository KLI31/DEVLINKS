"use client";

import { useState } from "react";
import { ChevronLeft, Search, Sparkles, Wind } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";
import { StickerItem } from "@/components/customize/StickerItem";
import { cn } from "@/lib/utils";

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
        s.label.toLowerCase().includes(query.toLowerCase()),
      )
    : PROGRAMMING_STICKERS;

  const isFull = placedCount >= 8;

  return (
    <div
      className="absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-lg backdrop-blur-sm transition-all duration-200"
      style={{
        width: isCollapsed ? 44 : 200,
        height: isCollapsed ? 44 : 380,
      }}
    >
      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex size-11 cursor-pointer items-center justify-center text-primary"
          aria-label="Expandir stickers"
        >
          <Sparkles className="size-5" />
        </button>
      ) : (
        <>
          <div className="flex items-center justify-between border-b border-border/30 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" />
              <span className="text-[11px] font-semibold text-foreground">
                Stickers
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              aria-label="Colapsar"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          </div>

          <div className="px-3 py-2">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${(placedCount / 8) * 100}%` }}
                />
              </div>
              <span className="text-[9px] tabular-nums text-muted-foreground">
                {placedCount}/8
              </span>
            </div>
            {isFull && (
              <p className="mt-1 text-[9px] font-medium text-error">
                Máximo alcanzado
              </p>
            )}
          </div>

          <div className="mx-3 mb-2">
            <button
              type="button"
              onClick={() => onToggleAnimation(!animationEnabled)}
              disabled={placedCount === 0}
              aria-pressed={animationEnabled}
              className="flex w-full items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-2.5 py-2 text-left transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Wind className="size-3.5 shrink-0 text-primary" />
              <span className="flex-1 text-[11px] font-medium text-foreground">
                Animar (flotando)
              </span>
              <span
                className={cn(
                  "relative h-4 w-7 shrink-0 rounded-full transition-colors",
                  animationEnabled ? "bg-primary" : "bg-muted-foreground/30",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-3 rounded-full bg-white transition-transform",
                    animationEnabled ? "translate-x-3.5" : "translate-x-0.5",
                  )}
                />
              </span>
            </button>
            {placedCount === 0 && (
              <p className="mt-1 text-[9px] text-muted-foreground">
                Agrega stickers para animarlos
              </p>
            )}
          </div>

          <div className="relative mx-3 mb-2">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="h-7 pl-6 text-[11px]"
            />
          </div>

          <div className="scroll-thin flex-1 overflow-y-auto px-3 pb-3">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-muted-foreground">
                Sin resultados
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
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
        </>
      )}
    </div>
  );
}
