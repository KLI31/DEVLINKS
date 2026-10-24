"use client";

import { useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { AuthUser } from "@/types/auth";
import type { CustomizeValues, SaveStatus } from "../../hooks/useCustomize";
import type { PlacedSticker, PublicProfile } from "@/types";
import { cn } from "@/lib/utils";
import { usePreviewData } from "@/hooks/usePreviewData";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { stickerColor } from "@/components/profile/StickerTile";
import { ProfileSticker } from "./ProfileSticker";

interface CustomizeCanvasProps {
  values: CustomizeValues;
  user: AuthUser | null;
  saveStatus: SaveStatus;
  onUpdateStickers: (stickers: PlacedSticker[]) => void;
  mode?: "preview" | "stickers";
}

function SaveBadge({ status, className }: { status: SaveStatus; className?: string }) {
  if (status === "idle") return null;

  const map = {
    saving: {
      border: "rgba(255,255,255,0.1)",
      bg: "rgba(0,0,0,0.5)",
      color: "rgba(255,255,255,0.55)",
    },
    saved: { border: "#22c55e40", bg: "#22c55e10", color: "#22c55e" },
    error: { border: "#ef444440", bg: "#ef444410", color: "#ef4444" },
  }[status];

  return (
    <div
      className={cn("absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm", className)}
      role="status"
      style={{ borderColor: map.border, background: map.bg, color: map.color }}
    >
      {status === "saving" && <Loader2 className="size-3 animate-spin" />}
      {status === "saved" && <Check className="size-3" />}
      {status === "error" && <AlertCircle className="size-3" />}
      {status === "saving"
        ? "Guardando…"
        : status === "saved"
          ? "Guardado"
          : "Error al guardar"}
    </div>
  );
}

export function CustomizeCanvas({
  values,
  user,
  saveStatus,
  onUpdateStickers,
  mode = "preview",
}: CustomizeCanvasProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const { links, projects, githubStats } = usePreviewData(user);

  const isStickersMode = mode === "stickers";

  const dropId = isStickersMode ? "stickers-canvas" : "profile-card-canvas";
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: dropId,
  });

  const handleStickerUpdate = (idx: number, updated: PlacedSticker) => {
    const next = [...values.stickers];
    next[idx] = updated;
    onUpdateStickers(next);
  };

  const handleStickerRemove = (index: number) => {
    const next = values.stickers.filter((_, i) => i !== index);
    onUpdateStickers(next);
    setSelectedIdx(null);
  };

  const profile = user
    ? {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        theme: values.theme,
        accentColor: values.accentColor,
        buttonStyle: values.buttonStyle,
        fontFamily: values.fontFamily,
        bgType: values.bgType,
        bgColor: values.bgColor,
        profileLayout: values.layout,
        coverImageUrl: values.coverImageUrl,
        layout: values.layout,
        title: values.title,
        titleStyle: values.titleStyle,
        titleColor: values.titleColor,
        pageTextColor: values.pageTextColor,
        buttonVariant: values.buttonVariant,
        buttonRadius: values.buttonRadius,
        buttonShadow: values.buttonShadow,
        buttonColor: values.buttonColor,
        buttonTextColor: values.buttonTextColor,
        altTitleFont: values.altTitleFont,
        titleFont: values.titleFont,
        stickers: isStickersMode ? [] : values.stickers,
        links,
        projects,
      }
    : null;

  const card = profile && (
    <PublicProfileCard
      profile={profile as unknown as PublicProfile}
      projects={projects}
      githubStats={githubStats}
      hideShare
    />
  );

  const stickerList = values.stickers.map((sticker, idx) => (
    <ProfileSticker
      key={`${sticker.id}-${idx}`}
      sticker={sticker}
      index={idx}
      brandColor={stickerColor(sticker.id, values.accentColor)}
      containerRef={cardRef}
      isSelected={selectedIdx === idx}
      onSelect={setSelectedIdx}
      onUpdate={handleStickerUpdate}
      onRemove={handleStickerRemove}
    />
  ));

  return (
    <div
      ref={setDroppableNodeRef}
      id={dropId}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-auto overscroll-contain rounded-2xl border border-border bg-[radial-gradient(circle,_color-mix(in_srgb,_var(--color-foreground)_9%,_transparent)_1px,_transparent_1px)] [background-size:20px_20px] transition-[box-shadow] duration-200 ease-out",
        isStickersMode ? "scroll-hide" : "scroll-thin",
      )}
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest("[data-sticker]")) {
          setSelectedIdx(null);
        }
      }}
      style={
        isOver
          ? { boxShadow: "inset 0 0 0 2px var(--color-primary)" }
          : undefined
      }
    >
      <SaveBadge
        status={saveStatus}
        className={isStickersMode ? "right-[296px]" : undefined}
      />

      {!isStickersMode ? (
        <div className="flex justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">{card}</div>
        </div>
      ) : (
        <div className="flex min-w-[820px] justify-center py-16 pr-[280px]">
          <div
            ref={cardRef}
            id="stickers-card"
            className="relative w-[480px] shrink-0"
            style={{ zoom: 0.8 }}
          >
            {card}
            <div className="pointer-events-none absolute inset-0 z-20">
              {stickerList}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
