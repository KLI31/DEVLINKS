"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Sticker } from "@/app/dashboard/customize/_data/stickers";
import { StickerTile } from "@/components/profile/StickerTile";
import { cn } from "@/lib/utils";

interface StickerItemProps {
  sticker: Sticker;
  disabled?: boolean;
}

export function StickerItem({ sticker, disabled }: StickerItemProps) {
  const { slug, label, brandColor } = sticker;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: slug,
    disabled,
    data: { slug, label, brandColor },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      aria-label={`Arrastrar sticker ${label}`}
      className={cn(
        "group flex touch-none flex-col items-center gap-2 rounded-xl px-1 py-2.5 outline-none transition-[background-color,opacity] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "cursor-grab hover:bg-muted/60 active:cursor-grabbing",
        isDragging && "opacity-30",
      )}
    >
      <StickerTile
        slug={slug}
        color={brandColor}
        size={56}
        className={cn(
          "motion-safe:transition-[translate]",
          !disabled && "motion-safe:group-hover:-translate-y-0.5",
        )}
      />
      <span className="w-full truncate text-center text-[11px] leading-none text-muted-foreground transition-colors duration-150 group-hover:text-foreground">
        {label}
      </span>
    </div>
  );
}
