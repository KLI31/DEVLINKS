"use client";

import { SectionHeader } from "@/components/customize/shared/SectionHeader";
import { ColorField } from "@/components/customize/shared/ColorField";
import { OptionCard } from "@/components/customize/shared/OptionCard";
import { cn } from "@/lib/utils";
import type { CustomizeValues } from "@/hooks/useCustomize";

const BUTTON_VARIANTS = [
  { id: "solid", label: "Sólido" },
  { id: "glass", label: "Glass" },
  { id: "outline", label: "Borde" },
];

const BUTTON_RADII = [
  { id: 0, label: "Cuadrado", px: "0px" },
  { id: 4, label: "Suave", px: "4px" },
  { id: 12, label: "Redondeado", px: "12px" },
  { id: 9999, label: "Píldora", px: "9999px" },
];

const BUTTON_SHADOWS = [
  { id: "none", label: "Ninguna" },
  { id: "soft", label: "Suave" },
  { id: "strong", label: "Fuerte" },
  { id: "hard", label: "Dura" },
];

interface ButtonsSectionProps {
  values: CustomizeValues;
  update: (patch: Partial<CustomizeValues>) => void;
  onBack: () => void;
}

export function ButtonsSection({
  values,
  update,
  onBack,
}: ButtonsSectionProps) {
  return (
    <div className="flex h-full flex-col">
      <SectionHeader title="Botones" onBack={onBack} />
      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto pr-1">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Estilo de botón
          </p>
          <div className="grid grid-cols-3 gap-2">
            {BUTTON_VARIANTS.map((v) => (
              <OptionCard
                key={v.id}
                label={v.label}
                active={values.buttonVariant === v.id}
                onClick={() => update({ buttonVariant: v.id })}
                preview={
                  <div
                    className="h-4 w-10"
                    style={{
                      borderRadius: "4px",
                      ...(v.id === "solid"
                        ? { background: values.buttonColor }
                        : v.id === "outline"
                          ? {
                              border: `1.5px solid ${values.buttonColor}55`,
                              background: "transparent",
                            }
                          : {
                              border: `1px solid ${values.buttonColor}30`,
                              background: `${values.buttonColor}18`,
                              backdropFilter: "blur(4px)",
                            }),
                    }}
                  />
                }
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Redondez de esquinas
          </p>
          <div className="grid grid-cols-4 gap-2">
            {BUTTON_RADII.map((r) => (
              <OptionCard
                key={r.id}
                label={r.label}
                active={values.buttonRadius === r.id}
                onClick={() => update({ buttonRadius: r.id })}
                preview={
                  <div
                    className="h-4 w-8 border border-border/40 bg-muted"
                    style={{ borderRadius: r.px }}
                  />
                }
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sombra de botón
          </p>
          <div className="flex flex-wrap gap-2">
            {BUTTON_SHADOWS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => update({ buttonShadow: s.id })}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-[11px] font-medium transition-all duration-150",
                  values.buttonShadow === s.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/50 text-muted-foreground hover:border-border hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <ColorField
          label="Color de botón"
          value={values.buttonColor}
          onChange={(v) => update({ buttonColor: v })}
        />

        <ColorField
          label="Color de texto de botón"
          value={values.buttonTextColor}
          onChange={(v) => update({ buttonTextColor: v })}
        />
      </div>
    </div>
  );
}
