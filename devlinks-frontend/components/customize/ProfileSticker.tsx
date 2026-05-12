"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { iconUrl } from "@/lib/icons";
import type { PlacedSticker } from "@/types";
import Image from "next/image";

const BASE_SIZE = 56;

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

export function ProfileSticker({
  sticker,
  index,
  brandColor,
  containerRef,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}: ProfileStickerProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragRef = useRef<{
    isDragging: boolean;
    offsetX: number;
    offsetY: number;
  }>({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  });
  const scaleRef = useRef<{ isResizing: boolean }>({ isResizing: false });

  const scale = sticker.scale ?? 1;
  const size = BASE_SIZE * scale;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const el = e.currentTarget as HTMLDivElement;
    el.setPointerCapture(e.pointerId);
    dragRef.current.isDragging = true;
    dragRef.current.offsetX = e.clientX;
    dragRef.current.offsetY = e.clientY;
    onSelect(index);
  }, [onSelect, index]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.isDragging) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      onUpdate(index, {
        ...sticker,
        x: Math.round(Math.max(2, Math.min(98, x)) * 10) / 10,
        y: Math.round(Math.max(2, Math.min(98, y)) * 10) / 10,
      });

      dragRef.current.offsetX = clientX;
      dragRef.current.offsetY = clientY;
    },
    [containerRef, onUpdate, sticker],
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current.isDragging = false;
  }, []);

  const handleScalePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    scaleRef.current.isResizing = true;
  }, []);

  const handleScalePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!scaleRef.current.isResizing) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + (sticker.x / 100) * rect.width;
      const centerY = rect.top + (sticker.y / 100) * rect.height;

      const dist = Math.sqrt((e.clientX - centerX) ** 2 + (e.clientY - centerY) ** 2);
      const newScale = Math.round(Math.max(0.5, Math.min(3, dist / (BASE_SIZE / 2))) * 100) / 100;

      onUpdate(index, { ...sticker, scale: newScale });
    },
    [containerRef, sticker, onUpdate, index],
  );

  const handleScalePointerUp = useCallback(() => {
    scaleRef.current.isResizing = false;
  }, []);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(index);
    }, 200);
  }, [onRemove, index]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -20, opacity: 0 }}
      animate={
        isRemoving
          ? { scale: 0, opacity: 0 }
          : { scale: 1, rotate: sticker.rotation, opacity: 1 }
      }
      transition={
        isRemoving
          ? { duration: 0.2 }
          : { type: "spring", stiffness: 260, damping: 20 }
      }
      data-sticker
      className="absolute pointer-events-auto"
      style={{
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        width: size,
        height: size,
        marginLeft: -(size / 2),
        marginTop: -(size / 2),
        zIndex: 10,
        cursor: dragRef.current.isDragging ? "grabbing" : "move",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute rounded-xl bg-white transition-shadow duration-200"
        style={{
          inset: -6,
          zIndex: -1,
          boxShadow: isSelected
            ? `0 0 0 2px ${brandColor}, 0 6px 20px rgba(0,0,0,0.35)`
            : isHovered
              ? "0 6px 20px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.2)"
              : "0 2px 8px rgba(0,0,0,0.25), 0 1px 2px rgba(0,0,0,0.15)",
        }}
      />

      <Image
        src={iconUrl(sticker.id, brandColor)}
        alt={sticker.id}
        width={BASE_SIZE}
        unoptimized
        height={BASE_SIZE}
        className="size-full object-contain"
        draggable={false}
      />

      <AnimatePresence>
        {isHovered && !isRemoving && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -right-1.5 -top-1.5 flex size-[18px] items-center justify-center rounded-full bg-[#ff4444] text-white shadow-md"
            style={{ zIndex: 20 }}
            type="button"
            aria-label="Eliminar sticker"
          >
            <X className="size-2.5" strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSelected && !isRemoving && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-2.5 -right-2.5 size-[18px] cursor-nwse-resize rounded-full border-2 border-white shadow-md"
            style={{ background: brandColor, zIndex: 20 }}
            onPointerDown={handleScalePointerDown}
            onPointerMove={handleScalePointerMove}
            onPointerUp={handleScalePointerUp}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
