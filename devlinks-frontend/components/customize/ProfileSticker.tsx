"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import type { PlacedSticker } from "@/types";
import { cn } from "@/lib/utils";
import {
  StickerTile,
  STICKER_BASE_SIZE,
  STICKER_BOUNDS,
  STICKER_SCALE,
  clampSticker,
} from "@/components/profile/StickerTile";

interface ProfileStickerProps {
  sticker: PlacedSticker;
  index: number;
  brandColor: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onUpdate: (index: number, updated: PlacedSticker) => void;
  onRemove: (index: number) => void;
}

const clamp = (v: number, [min, max]: readonly [number, number]) =>
  Math.round(Math.max(min, Math.min(max, v)) * 10) / 10;

export function ProfileSticker({
  sticker: raw,
  index,
  brandColor,
  containerRef,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: ProfileStickerProps) {
  const reduceMotion = useReducedMotion();
  const sticker = clampSticker(raw);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isResizing = useRef(false);

  const scale = sticker.scale ?? 1;
  const size = Math.round(STICKER_BASE_SIZE * scale);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      onSelect(index);
    },
    [onSelect, index],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      onUpdate(index, {
        ...sticker,
        x: clamp(((e.clientX - rect.left) / rect.width) * 100, STICKER_BOUNDS.x),
        y: clamp(((e.clientY - rect.top) / rect.height) * 100, STICKER_BOUNDS.y),
      });
    },
    [containerRef, onUpdate, sticker, index, isDragging],
  );

  const handleScalePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    isResizing.current = true;
  }, []);

  const handleScalePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing.current) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + (sticker.x / 100) * rect.width;
      const centerY = rect.top + (sticker.y / 100) * rect.height;
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const next = dist / (STICKER_BASE_SIZE / Math.SQRT2);
      onUpdate(index, {
        ...sticker,
        scale: Math.round(
          Math.max(STICKER_SCALE.min, Math.min(STICKER_SCALE.max, next)) * 100,
        ) / 100,
      });
    },
    [containerRef, sticker, onUpdate, index],
  );

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => onRemove(index), 150);
  }, [onRemove, index]);

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
      animate={
        isRemoving
          ? reduceMotion
            ? { opacity: 0 }
            : { scale: 0.6, opacity: 0 }
          : { scale: isDragging && !reduceMotion ? 1.06 : 1, opacity: 1 }
      }
      transition={
        isRemoving
          ? { duration: 0.15, ease: "easeOut" }
          : { type: "spring", duration: 0.3, bounce: 0 }
      }
      data-sticker
      className="group pointer-events-auto absolute touch-none"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        marginLeft: -(size / 2),
        marginTop: -(size / 2),
        rotate: sticker.rotation,
        zIndex: isSelected ? 30 : 10,
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setIsDragging(false)}
    >
      <StickerTile
        slug={sticker.id}
        color={brandColor}
        size={size}
        lifted={isDragging}
        className={cn(
          "outline-offset-4",
          isSelected
            ? "outline-2 outline-primary"
            : "outline-0 outline-transparent",
        )}
      />

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className={cn(
          "absolute -right-3 -top-3 flex size-6 cursor-pointer items-center justify-center rounded-full bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.2)] transition-[opacity,scale] duration-150 ease-out hover:bg-destructive hover:text-white active:scale-[0.96]",
          isSelected
            ? "opacity-100"
            : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
        )}
        aria-label="Eliminar sticker"
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>

      {isSelected && (
        <div
          role="presentation"
          className="absolute -bottom-3 -right-3 size-6 cursor-nwse-resize touch-none rounded-full border-2 border-white bg-primary shadow-[0_1px_2px_rgba(0,0,0,0.2),0_4px_8px_rgba(0,0,0,0.2)]"
          onPointerDown={handleScalePointerDown}
          onPointerMove={handleScalePointerMove}
          onPointerUp={() => {
            isResizing.current = false;
          }}
        />
      )}
    </motion.div>
  );
}
