"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useAuthStore } from "@/store/auth-store";
import { AppearancePanel } from "@/components/customize/AppearancePanel";
import { CustomizeCanvas } from "@/components/customize/CustomizeCanvas";
import { StickersPanel } from "@/components/customize/StickersPanel";
import { useCustomize } from "@/hooks/useCustomize";
import { iconUrl } from "@/lib/icons";
import Image from "next/image";

interface ActiveSticker {
  slug: string;
  brandColor: string;
}

export default function CustomizePage() {
  const { user } = useAuthStore();
  const { values, update, updateStickers, saveStatus, isLoading } =
    useCustomize();
  const [activeSticker, setActiveSticker] = useState<ActiveSticker | null>(
    null,
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as {
      slug: string;
      label: string;
      brandColor: string;
    };
    setActiveSticker({ slug: data.slug, brandColor: data.brandColor });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSticker(null);
    const { active, over } = event;
    if (!over || over.id !== "profile-card-canvas") return;

    const stickerSlug = active.id as string;
    const delta = event.delta;

    const canvas = document.getElementById("profile-card-canvas");
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x =
      ((event.activatorEvent as PointerEvent).clientX + delta.x - rect.left) /
      rect.width;
    const y =
      ((event.activatorEvent as PointerEvent).clientY + delta.y - rect.top) /
      rect.height;

    const clampedX = Math.max(0.05, Math.min(0.95, x));
    const clampedY = Math.max(0.05, Math.min(0.95, y));

    if (values.stickers.length >= 8) return;

    updateStickers([
      ...values.stickers,
      {
        id: stickerSlug,
        x: Math.round(clampedX * 1000) / 10,
        y: Math.round(clampedY * 1000) / 10,
        rotation: Math.round((Math.random() * 16 - 8) * 10) / 10,
        scale: 1,
      },
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="size-5 animate-spin rounded-full border-2 border-border border-t-transparent" />
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full min-h-0 gap-6 overflow-hidden">
        <AppearancePanel
          values={values}
          update={update}
          githubUsername={user?.githubUsername}
        />
        <CustomizeCanvas
          values={values}
          user={user}
          saveStatus={saveStatus}
          onUpdateStickers={updateStickers}
        />
        <StickersPanel placedCount={values.stickers.length} />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeSticker ? (
          <div
            className="relative flex items-center justify-center rounded-xl"
            style={{
              width: 56,
              height: 56,
              background: `${activeSticker.brandColor}15`,
              border: `1px solid ${activeSticker.brandColor}50`,
              rotate: "-6deg",
            }}
          >
            <div
              className="absolute rounded-xl bg-white"
              style={{
                inset: -6,
                zIndex: -1,
                boxShadow: `0 12px 40px ${activeSticker.brandColor}50, 0 4px 16px rgba(0,0,0,0.35)`,
              }}
            />

            <Image
              src={iconUrl(activeSticker.slug, activeSticker.brandColor)}
              alt={activeSticker.slug}
              width={56}
              height={56}
              unoptimized
              style={{
                width: 56,
                height: 56,
                objectFit: "contain",
                pointerEvents: "none",
              }}
              draggable={false}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
