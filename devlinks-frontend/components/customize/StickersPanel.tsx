"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";
import { StickerItem } from "@/components/customize/StickerItem";

interface StickersPanelProps {
  placedCount: number;
}

export function StickersPanel({ placedCount }: StickersPanelProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? PROGRAMMING_STICKERS.filter((s) =>
        s.label.toLowerCase().includes(query.toLowerCase()),
      )
    : PROGRAMMING_STICKERS;

  const isFull = placedCount >= 8;

  return (
    <div className="flex h-full w-[220px] shrink-0 flex-col overflow-hidden">
      <div className="mb-4 shrink-0">
        <p className="text-sm font-semibold text-foreground">Stickers</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Arrastra hasta 8 stickers a tu perfil
        </p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(placedCount / 8) * 100}%` }}
            />
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {placedCount}/8
          </span>
        </div>
        {isFull && (
          <p className="mt-1 text-[10px] font-medium text-error">
            Máximo alcanzado
          </p>
        )}
      </div>

      <div className="relative mb-3 shrink-0">
        <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar tecnología..."
          className="pl-7 text-xs"
        />
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto pl-0.5 pr-1">
        {filtered.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-muted-foreground">
            Sin resultados
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
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
    </div>
  );
}
