"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AvatarUploadModal,
  type AvatarUploadResult,
} from "./avatarUploadModal";

interface AvatarUploadProps {
  src?: string | null;
  fallback: string;
  onChange?: (result: AvatarUploadResult) => void;
  className?: string;
}

export function AvatarUpload({
  src,
  fallback,
  onChange,
  className,
}: AvatarUploadProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState<AvatarUploadResult>(null);

  const displaySrc =
    currentResult?.type === "file"
      ? currentResult.preview
      : currentResult?.type === "url"
        ? currentResult.url
        : src;

  const handleConfirm = (result: AvatarUploadResult) => {
    setCurrentResult(result);
    onChange?.(result);
  };

  return (
    <>
      <div className={cn("flex items-center gap-4", className)}>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="group relative h-14 w-14 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
          aria-label="Cambiar foto de perfil"
        >
          <Avatar className="h-14 w-14">
            {displaySrc && <AvatarImage src={displaySrc} alt="Avatar" />}
            <AvatarFallback className="bg-muted text-sm font-medium text-muted-foreground">
              {fallback}
            </AvatarFallback>
          </Avatar>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-4 text-white" />
            <span className="text-[9px] font-medium leading-none text-white">
              Cambiar
            </span>
          </div>

          <div className="absolute bottom-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 border-card bg-muted shadow-sm">
            <Camera className="size-2.5 text-muted-foreground" />
          </div>
        </button>

        <div>
          <p className="text-sm font-medium text-foreground">Foto de perfil</p>
          <p className="text-xs text-muted-foreground">
            Haz clic en el avatar para cambiar tu imagen
          </p>
        </div>
      </div>

      <AvatarUploadModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentSrc={src}
        fallback={fallback}
        onConfirm={handleConfirm}
      />
    </>
  );
}
