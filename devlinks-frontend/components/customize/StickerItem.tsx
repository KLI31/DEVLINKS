"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { iconUrl } from "@/lib/icons";
import type { Sticker } from "@/app/dashboard/customize/_data/stickers";
import Image from "next/image";

interface StickerItemProps {
  sticker: Sticker;
  disabled?: boolean;
}

export function StickerItem({ sticker, disabled }: StickerItemProps) {
  const { slug, label, brandColor } = sticker;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: slug,
      disabled,
      data: { slug, label, brandColor },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0 : disabled ? 0.45 : 1,
    background: `${brandColor}15`,
    border: `1px solid ${brandColor}35`,
    boxShadow: isDragging ? `0 8px 30px ${brandColor}40` : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="group flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all duration-150 hover:scale-105 hover:rotate-[-3deg]"
      style={style}
    >
      <Image
        src={iconUrl(slug, brandColor)}
        alt={label}
        width={32}
        height={32}
        className="size-8 object-contain pointer-events-none"
        loading="lazy"
        unoptimized
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
        }}
      />
      <span
        className="max-w-full truncate text-center text-[9px] font-medium leading-none tracking-wide"
        style={{ color: brandColor, opacity: 0.75 }}
      >
        {label}
      </span>
    </div>
  );
}
