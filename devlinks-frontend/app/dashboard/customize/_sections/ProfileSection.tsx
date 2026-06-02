"use client";

import { SectionHeader } from "@/components/customize/shared/SectionHeader";
import { OptionCard } from "@/components/customize/shared/OptionCard";
import { Input } from "@/components/ui/input";
import Image from "next/image";
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

  return (
    <div className="flex h-full flex-col">
      <SectionHeader title="Perfil" onBack={onBack} />
      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto pr-1">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Layout
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Classic layout preview */}
            <OptionCard
              label="Classic"
              active={values.layout === "classic"}
              onClick={() => update({ layout: "classic" })}
              preview={
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg px-3"
                  style={{ background: values.bgColor }}
                >
                  <div
                    className="size-10 shrink-0 overflow-hidden rounded-full shadow-md"
                    style={{
                      background: userAvatarUrl ? undefined : `${values.accentColor}50`,
                      boxShadow: `0 0 0 2px ${values.bgColor}, 0 0 0 3.5px ${values.accentColor}80`,
                    }}
                  >
                    {userAvatarUrl && (
                      <Image src={userAvatarUrl} alt="" width={40} height={40} className="size-full object-cover" />
                    )}
                  </div>
                  <div className="flex w-full flex-col items-center gap-1.5">
                    <div className="h-2 w-16 rounded-full bg-white/25" />
                    <div className="h-1.5 w-10 rounded-full" style={{ background: `${values.accentColor}80` }} />
                  </div>
                </div>
              }
            />
            {/* Hero layout preview */}
            <OptionCard
              label="Hero"
              active={values.layout === "hero"}
              onClick={() => update({ layout: "hero" })}
              preview={
                <div className="relative h-full w-full overflow-hidden rounded-lg">
                  {/* Cover — full height with gradient fade at bottom */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: values.coverImageUrl
                        ? `url(${values.coverImageUrl}) center/cover`
                        : `linear-gradient(160deg, ${values.accentColor} 0%, ${values.bgColor} 100%)`,
                    }}
                  />
                  {/* Gradient fade cover → bgColor */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, transparent 30%, ${values.bgColor}cc 65%, ${values.bgColor} 100%)`,
                    }}
                  />
                  {/* Avatar centered */}
                  <div
                    className="absolute left-1/2 z-10 -translate-x-1/2 size-9 overflow-hidden rounded-full"
                    style={{
                      top: "18%",
                      background: userAvatarUrl ? undefined : `${values.accentColor}60`,
                      boxShadow: `0 0 0 2px ${values.bgColor}, 0 0 0 3.5px ${values.accentColor}80`,
                    }}
                  >
                    {userAvatarUrl && (
                      <Image src={userAvatarUrl} alt="" width={36} height={36} className="size-full object-cover" />
                    )}
                  </div>
                  {/* Name below avatar */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 px-3 pb-3 pt-0">
                    <div className="h-2 w-14 rounded-full bg-white/30" />
                    <div className="h-1.5 w-9 rounded-full" style={{ background: `${values.accentColor}90` }} />
                  </div>
                </div>
              }
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Imagen de portada
          </p>
          <Input
            value={values.coverImageUrl}
            onChange={(e) => update({ coverImageUrl: e.target.value })}
            placeholder="https://ejemplo.com/imagen.jpg"
            className="text-xs"
          />
          {values.coverImageUrl && values.layout === "hero" && (
            <div
              className="mt-2 h-20 w-full overflow-hidden rounded-lg border border-border/40 bg-cover bg-center"
              style={{ backgroundImage: `url(${values.coverImageUrl})` }}
            />
          )}
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
