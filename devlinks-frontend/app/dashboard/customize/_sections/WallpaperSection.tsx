"use client";

import { SectionHeader } from "@/components/customize/shared/SectionHeader";
import { ColorField } from "@/components/customize/shared/ColorField";
import { OptionCard } from "@/components/customize/shared/OptionCard";
import { cn } from "@/lib/utils";
import type { CustomizeValues } from "@/hooks/useCustomize";

const WALLPAPER_STYLES = [
  { id: "fill", label: "Plano" },
  { id: "gradient", label: "Gradiente" },
  { id: "blur", label: "Desenfoque" },
  { id: "pattern", label: "Patrón" },
];

type BgPreset = {
  id: string;
  label: string;
  patch: Partial<CustomizeValues>;
};

// Temas curados con contraste AA (texto claro sobre fondos oscuros, o texto
// oscuro sobre el tema claro). Cada uno fija fondo, acento y los colores de
// texto/botón para que la card quede coherente de un clic.
const BG_PRESETS: BgPreset[] = [
  {
    id: "midnight-teal",
    label: "Midnight",
    patch: { bgType: "fill", bgColor: "#0F172A", accentColor: "#0D9488", pageTextColor: "#F8FAFC", titleColor: "#F8FAFC", buttonColor: "#0D9488", buttonTextColor: "#FFFFFF" },
  },
  {
    id: "ocean",
    label: "Ocean",
    patch: { bgType: "gradient", bgColor: "#0B1E2D", accentColor: "#2563EB", pageTextColor: "#E2E8F0", titleColor: "#F8FAFC", buttonColor: "#2563EB", buttonTextColor: "#FFFFFF" },
  },
  {
    id: "rose",
    label: "Rosé",
    patch: { bgType: "fill", bgColor: "#1A1014", accentColor: "#F43F5E", pageTextColor: "#FCE7EC", titleColor: "#FFFFFF", buttonColor: "#F43F5E", buttonTextColor: "#FFFFFF" },
  },
  {
    id: "sunset",
    label: "Sunset",
    patch: { bgType: "gradient", bgColor: "#1C1410", accentColor: "#FB923C", pageTextColor: "#FFF7ED", titleColor: "#FFEDD5", buttonColor: "#FB923C", buttonTextColor: "#1C1410" },
  },
  {
    id: "forest",
    label: "Forest",
    patch: { bgType: "fill", bgColor: "#0C1A12", accentColor: "#22C55E", pageTextColor: "#ECFDF5", titleColor: "#FFFFFF", buttonColor: "#22C55E", buttonTextColor: "#06210F" },
  },
  {
    id: "grape",
    label: "Grape",
    patch: { bgType: "gradient", bgColor: "#14101F", accentColor: "#A855F7", pageTextColor: "#F3E8FF", titleColor: "#FFFFFF", buttonColor: "#A855F7", buttonTextColor: "#FFFFFF" },
  },
  {
    id: "slate",
    label: "Slate",
    patch: { bgType: "fill", bgColor: "#111317", accentColor: "#94A3B8", pageTextColor: "#E5E7EB", titleColor: "#F8FAFC", buttonColor: "#94A3B8", buttonTextColor: "#0B0D10" },
  },
  {
    id: "mono-light",
    label: "Light",
    patch: { bgType: "fill", bgColor: "#F8FAFC", accentColor: "#0F172A", pageTextColor: "#0F172A", titleColor: "#0F172A", buttonColor: "#0F172A", buttonTextColor: "#FFFFFF" },
  },
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
            Temas
          </p>
          <div className="grid grid-cols-4 gap-2">
            {BG_PRESETS.map((preset) => {
              const presetBg = preset.patch.bgColor ?? "#000000";
              const presetAccent = preset.patch.accentColor ?? "#ffffff";
              const isActive =
                values.bgColor.toLowerCase() === presetBg.toLowerCase() &&
                values.accentColor.toLowerCase() === presetAccent.toLowerCase();
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => update(preset.patch)}
                  aria-label={preset.label}
                  className={cn(
                    "group flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors cursor-pointer",
                    isActive
                      ? "border-primary ring-1 ring-primary"
                      : "border-border/40 hover:border-border",
                  )}
                >
                  <span
                    className="relative h-9 w-full overflow-hidden rounded-md"
                    style={{
                      background:
                        preset.patch.bgType === "gradient"
                          ? `linear-gradient(135deg, ${presetBg} 0%, ${presetAccent} 140%)`
                          : presetBg,
                    }}
                  >
                    <span
                      className="absolute bottom-1 right-1 size-2.5 rounded-full ring-1 ring-black/20"
                      style={{ background: presetAccent }}
                    />
                  </span>
                  <span className="text-[10px] text-muted-foreground group-hover:text-foreground">
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

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
                                  backgroundColor: bgColor,
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
