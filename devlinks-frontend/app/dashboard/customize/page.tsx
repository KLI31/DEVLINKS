"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { AppearancePanel } from "@/components/customize/AppearancePanel";
import { CustomizeCanvas } from "@/components/customize/CustomizeCanvas";
import { StickersFloatingPanel } from "@/components/customize/StickersFloatingPanel";
import { useCustomize } from "@/hooks/useCustomize";
import { iconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";
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

  const searchParams = useSearchParams();
  const isStickersMode = searchParams.get("section") === "stickers";

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
    if (!over) return;

    const dropId = over.id as string;
    if (dropId !== "profile-card-canvas" && dropId !== "stickers-canvas")
      return;

    const stickerSlug = active.id as string;
    const delta = event.delta;

    // Use the card element as reference so stored coords are card-relative,
    // matching how PublicProfileCard renders stickers (left/top as % of card).
    const refEl = isStickersMode
      ? document.getElementById("stickers-card")
      : document.getElementById("profile-card-canvas");
    if (!refEl) return;

    const rect = refEl.getBoundingClientRect();
    const pointerX = (event.activatorEvent as PointerEvent).clientX + delta.x;
    const pointerY = (event.activatorEvent as PointerEvent).clientY + delta.y;

    // rect dimensions already account for CSS zoom, same space as clientX/Y.
    const x = (pointerX - rect.left) / rect.width;
    const y = (pointerY - rect.top) / rect.height;

    const clampedX = Math.max(-2.0, Math.min(3.0, x));
    const clampedY = Math.max(-2.0, Math.min(3.0, y));

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
      <div className={cn(
        "flex h-full min-h-0 gap-6",
        isStickersMode ? "overflow-auto" : "overflow-hidden"
      )}>
        {!isStickersMode && (
          <AppearancePanel
            values={values}
            update={update}
            userDisplayName={user?.displayName}
            userAvatarUrl={user?.avatarUrl}
          />
        )}

        <div className={cn(
          "relative flex min-h-0 flex-col",
          isStickersMode ? "flex-1 overflow-auto" : "flex-1"
        )}>
          {isStickersMode && (
            <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
              <a
                href="?"
                className="flex items-center gap-1 rounded-lg border border-border/50 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-muted/50 cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                Volver
              </a>
              <span className="text-xs font-semibold text-foreground">
                ✨ Stickers
              </span>
            </div>
          )}

          <CustomizeCanvas
            values={values}
            user={user}
            saveStatus={saveStatus}
            onUpdateStickers={updateStickers}
            mode={isStickersMode ? "stickers" : "preview"}
          />

          {isStickersMode && (
            <StickersFloatingPanel placedCount={values.stickers.length} />
          )}
        </div>
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
