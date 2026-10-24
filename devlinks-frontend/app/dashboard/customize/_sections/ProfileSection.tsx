"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/customize/shared/SectionHeader";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { extractDominantColor, deriveBg } from "@/lib/extract-color";
import type { CustomizeValues } from "@/hooks/useCustomize";

interface ProfileSectionProps {
  values: CustomizeValues;
  update: (patch: Partial<CustomizeValues>) => void;
  onBack: () => void;
  userAvatarUrl?: string | null;
  userDisplayName?: string;
}

export function ProfileSection({
  values,
  update,
  onBack,
  userAvatarUrl,
  userDisplayName,
}: ProfileSectionProps) {
  const initials = userDisplayName
    ? userDisplayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const coverImageUrl = values.coverImageUrl;
  const [extracting, setExtracting] = useState(false);
  // Guarda el último cover ya procesado para no re-extraer en cada render ni
  // sobrescribir los colores guardados al abrir la sección.
  const lastProcessed = useRef<string | null>(coverImageUrl || null);

  useEffect(() => {
    const url = coverImageUrl?.trim();
    if (!url || url === lastProcessed.current) return;

    let active = true;
    const timer = setTimeout(async () => {
      setExtracting(true);
      const hex = await extractDominantColor(url);
      if (!active) return;
      lastProcessed.current = url;
      setExtracting(false);
      if (hex) {
        update({ accentColor: hex, bgColor: deriveBg(hex) });
      }
    }, 500);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [coverImageUrl, update]);

  return (
    <div className="flex h-full flex-col">
      <SectionHeader title="Perfil" onBack={onBack} />
      <div className="scroll-thin flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">
            Imagen de portada
          </p>
          <Input
            value={values.coverImageUrl}
            onChange={(e) => update({ coverImageUrl: e.target.value })}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="text-xs"
          />
          {extracting ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Aplicando color de la portada…
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              El acento y el fondo se ajustan al color de la imagen.
            </p>
          )}
          {values.coverImageUrl && (
            <div
              className="mt-2 h-20 w-full overflow-hidden rounded-lg border border-border/40 bg-cover bg-center"
              style={{ backgroundImage: `url(${values.coverImageUrl})` }}
            />
          )}
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">
            Imagen de perfil
          </p>
          <div className="flex items-center gap-3">
            <div className="size-10 overflow-hidden rounded-full bg-muted">
              {userAvatarUrl ? (
                <Image
                  src={userAvatarUrl}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-xs font-bold text-muted-foreground">
                  {initials}
                </div>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">
              Cambia tu avatar desde ajustes de cuenta
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
