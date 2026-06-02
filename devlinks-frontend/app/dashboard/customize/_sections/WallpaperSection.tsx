"use client";

import { SectionHeader } from "@/components/customize/shared/SectionHeader";
import { ColorField } from "@/components/customize/shared/ColorField";
import { OptionCard } from "@/components/customize/shared/OptionCard";
import type { CustomizeValues } from "@/hooks/useCustomize";

const WALLPAPER_STYLES = [
  { id: "fill", label: "Plano" },
  { id: "gradient", label: "Gradiente" },
  { id: "blur", label: "Desenfoque" },
  { id: "pattern", label: "Patrón" },
];

interface WallpaperSectionProps {
  values: CustomizeValues;
  update: (patch: Partial<CustomizeValues>) => void;
  onBack: () => void;
}

export function WallpaperSection({
  values,
  update,
  onBack,
}: WallpaperSectionProps) {
  const accentColor = values.accentColor;
  const bgColor = values.bgColor;
  const bgType = values.bgType;

  const showAccent = bgType === "gradient" || bgType === "blur";
  const bgLabel =
    bgType === "gradient" ? "Color inicial" :
    bgType === "blur" ? "Color base" :
    "Color de fondo";
  const accentLabel = bgType === "gradient" ? "Color final" : "Color de acento";

  return (
    <div className="flex h-full flex-col">
      <SectionHeader title="Fondo" onBack={onBack} />
      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto pr-1">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Estilo de fondo
          </p>
          <div className="grid grid-cols-2 gap-2">
            {WALLPAPER_STYLES.map((w) => {
              const isActive = values.bgType === w.id;
              return (
                <OptionCard
                  key={w.id}
                  label={w.label}
                  active={isActive}
                  onClick={() => update({ bgType: w.id })}
                  preview={
                    <div
                      className="h-10 w-full rounded-md border border-border/30"
                      style={
                        w.id === "fill"
                          ? { background: bgColor }
                          : w.id === "gradient"
                            ? {
                                background: `linear-gradient(135deg, ${bgColor} 0%, ${accentColor} 100%)`,
                              }
                            : w.id === "blur"
                              ? {
                                  background: `linear-gradient(160deg, ${bgColor} 0%, ${accentColor}40 100%)`,
                                  backdropFilter: "blur(4px)",
                                  position: "relative",
                                  overflow: "hidden",
                                }
                              : {
                                  background: `${bgColor}`,
                                  backgroundImage:
                                    "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
                                  backgroundSize: "8px 8px",
                                }
                      }
                    >
                      {w.id === "blur" && (
                        <div
                          className="absolute inset-0"
                          style={{
                            background: `repeating-linear-gradient(45deg, ${accentColor}10, ${accentColor}10 4px, transparent 4px, transparent 8px)`,
                          }}
                        />
                      )}
                    </div>
                  }
                />
              );
            })}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <ColorField
              label={bgLabel}
              value={values.bgColor}
              onChange={(v) => update({ bgColor: v })}
            />
            {showAccent && (
              <ColorField
                label={accentLabel}
                value={values.accentColor}
                onChange={(v) => update({ accentColor: v })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
