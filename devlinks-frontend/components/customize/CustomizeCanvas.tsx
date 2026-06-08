"use client";

import { useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type { AuthUser } from "@/types/auth";
import type { CustomizeValues, SaveStatus } from "../../hooks/useCustomize";
import type { PlacedSticker } from "@/types";
import { cn } from "@/lib/utils";
import { PROGRAMMING_STICKERS } from "@/app/dashboard/customize/_data/stickers";
import { usePreviewData } from "@/hooks/usePreviewData";
import { ProfileSticker } from "./ProfileSticker";
import { ProfilePreview } from "./ProfilePreview";

interface CustomizeCanvasProps {
  values: CustomizeValues;
  user: AuthUser | null;
  saveStatus: SaveStatus;
  onUpdateStickers: (stickers: PlacedSticker[]) => void;
  mode?: "preview" | "stickers";
}

function SaveBadge({ status }: { status: SaveStatus }) {
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
      className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm"
      style={{ borderColor: map.border, background: map.bg, color: map.color }}
    >
      {status === "saving" && <Loader2 className="size-3 animate-spin" />}
      {status === "saved" && <Check className="size-3" />}
      {status === "error" && <AlertCircle className="size-3" />}
      {status === "saving"
        ? "Guardando..."
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
  const containerRef = useRef<HTMLDivElement>(null);
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
        stickers: values.stickers,
        links,
        projects,
      }
    : null;

  const stickerList = values.stickers.map((sticker, idx) => {
    const meta = PROGRAMMING_STICKERS.find((s) => s.slug === sticker.id);
    return (
      <ProfileSticker
        key={`${sticker.id}-${idx}`}
        sticker={sticker}
        index={idx}
        brandColor={meta?.brandColor ?? values.accentColor}
        containerRef={cardRef as React.RefObject<HTMLDivElement | null>}
        isSelected={selectedIdx === idx}
        onSelect={(idx: number) => setSelectedIdx(idx)}
        onUpdate={handleStickerUpdate}
        onRemove={handleStickerRemove}
        mode={mode}
      />
    );
  });

  return (
    <div
      ref={(node) => {
        setDroppableNodeRef(node);
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      id={dropId}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col rounded-2xl border border-border/40 bg-muted/10",
        !isStickersMode && "scroll-thin overflow-y-auto p-4",
        isStickersMode && "scroll-hide overflow-auto",
        isStickersMode && "bg-[radial-gradient(circle,_color-mix(in_srgb,_currentColor_12%,_transparent)_1px,_transparent_1px)] [background-size:22px_22px]",
      )}
      onPointerDown={(e) => {
        if (!(e.target as HTMLElement).closest("[data-sticker]")) {
          setSelectedIdx(null);
        }
      }}
      style={
        isOver
          ? {
              boxShadow: `0 0 0 2px ${values.accentColor}80, 0 8px 32px ${values.accentColor}30`,
              transition: "box-shadow 200ms ease",
            }
          : undefined
      }
    >
      <SaveBadge status={saveStatus} />

      {!isStickersMode ? (
        <div className="flex min-h-0 justify-center py-4">
          <div style={{ width: 390, zoom: 0.88 }}>
            {profile && (
              <ProfilePreview
                profile={profile as unknown as Parameters<typeof ProfilePreview>[0]["profile"]}
                projects={projects}
                links={links}
                githubStats={githubStats}
                layout={values.layout as "classic" | "hero"}
              />
            )}
          </div>
        </div>
      ) : (
        // Wide stage so stickers can be placed freely around the card
        <div
          className="flex items-start justify-center py-12"
          style={{ minWidth: "max(100%, 1100px)", minHeight: "100%" }}
        >
          <div
            ref={cardRef}
            id="stickers-card"
            className="relative"
            style={{ zoom: 0.68 }}
          >
            {profile && (
              <ProfilePreview
                profile={profile as unknown as Parameters<typeof ProfilePreview>[0]["profile"]}
                projects={projects}
                links={links}
                githubStats={githubStats}
                layout={values.layout as "classic" | "hero"}
              />
            )}
            <div
              className="pointer-events-none absolute inset-0 z-20"
              style={{ overflow: "visible" }}
            >
              {stickerList}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
