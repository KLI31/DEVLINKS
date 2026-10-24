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
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { AppearancePanel } from "@/components/customize/AppearancePanel";
import { CustomizeCanvas } from "@/components/customize/CustomizeCanvas";
import { StickersFloatingPanel } from "@/components/customize/StickersFloatingPanel";
import { useCustomize } from "@/hooks/useCustomize";
import { cn } from "@/lib/utils";
import {
  StickerTile,
  STICKER_BASE_SIZE,
  STICKER_MAX,
  clampSticker,
} from "@/components/profile/StickerTile";

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

  const animationEnabled =
    values.stickers.length > 0 && values.stickers.every((s) => s.animated);

  const handleToggleAnimation = (enabled: boolean) => {
    updateStickers(values.stickers.map((s) => ({ ...s, animated: enabled })));
  };

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

    if (values.stickers.length >= STICKER_MAX) return;

    const placed = clampSticker({
      id: stickerSlug,
      x: x * 100,
      y: y * 100,
      rotation: Math.round((Math.random() * 16 - 8) * 10) / 10,
      scale: 1,
      animated: animationEnabled,
    });
    updateStickers([
      ...values.stickers,
      {
        ...placed,
        x: Math.round(placed.x * 10) / 10,
        y: Math.round(placed.y * 10) / 10,
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
            <div className="absolute left-4 top-4 z-20 flex items-center gap-3">
              <Link
                href="/dashboard/customize"
                replace
                scroll={false}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card pl-2 pr-3 text-[12px] font-medium text-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-muted active:scale-[0.96]"
              >
                <ChevronLeft className="size-4" />
                Volver
              </Link>
              <p className="hidden max-w-[340px] text-[12px] leading-snug text-muted-foreground xl:block">
                Selecciona un sticker para moverlo, cambiar su tamaño desde la
                esquina o quitarlo.
              </p>
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
            <StickersFloatingPanel
              placedCount={values.stickers.length}
              animationEnabled={animationEnabled}
              onToggleAnimation={handleToggleAnimation}
            />
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeSticker ? (
          <StickerTile
            slug={activeSticker.slug}
            color={activeSticker.brandColor}
            size={STICKER_BASE_SIZE}
            lifted
            className="-rotate-6 cursor-grabbing"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
