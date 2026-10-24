"use client";

import { SectionHeader } from "@/components/customize/shared/SectionHeader";
import { ColorField } from "@/components/customize/shared/ColorField";
import { OptionCard } from "@/components/customize/shared/OptionCard";
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

const SHADOW_CSS: Record<string, string> = {
  none: "none",
  soft: "0 2px 8px rgba(0,0,0,0.18)",
  strong: "0 4px 16px rgba(0,0,0,0.38)",
  hard: "2px 3px 0px rgba(0,0,0,0.55)",
};

function MiniButton({ values, variant, radius, shadow }: { values: CustomizeValues; variant: string; radius: number; shadow: string }) {
  const c = values.buttonColor;
  const style: React.CSSProperties =
    variant === "outline"
      ? { border: `1.5px solid ${c}`, background: "transparent", color: c }
      : variant === "glass"
        ? { border: `1px solid ${c}55`, background: `${c}30`, color: "#fff" }
        : { border: "1.5px solid transparent", background: c, color: values.buttonTextColor };
  return (
    <div
      className="flex h-7 w-[76%] items-center justify-center text-[10px] font-semibold"
      style={{ ...style, borderRadius: Math.min(radius, 14), boxShadow: SHADOW_CSS[shadow] }}
    >
      Link
    </div>
  );
}

const BUTTON_SHADOWS = [
  { id: "none", label: "Ninguna" },
  { id: "soft", label: "Suave" },
  { id: "strong", label: "Fuerte" },
  { id: "hard", label: "Dura" },
];

function readableOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#0B0D10" : "#FFFFFF";
}

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
      <div className="scroll-thin flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">
            Estilo de botón
          </p>
          <div className="grid grid-cols-3 gap-2">
            {BUTTON_VARIANTS.map((v) => (
              <OptionCard
                key={v.id}
                label={v.label}
                active={values.buttonVariant === v.id}
                onClick={() => update({ buttonVariant: v.id })}
                preview={<MiniButton values={values} variant={v.id} radius={values.buttonRadius} shadow={values.buttonShadow} />}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">
            Redondez de esquinas
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BUTTON_RADII.map((r) => (
              <OptionCard
                key={r.id}
                label={r.label}
                active={values.buttonRadius === r.id}
                onClick={() => update({ buttonRadius: r.id })}
                preview={<MiniButton values={values} variant={values.buttonVariant} radius={r.id} shadow="none" />}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-foreground">
            Sombra de botón
          </p>
          <div className="grid grid-cols-2 gap-2">
            {BUTTON_SHADOWS.map((sh) => (
              <OptionCard
                key={sh.id}
                label={sh.label}
                active={values.buttonShadow === sh.id}
                onClick={() => update({ buttonShadow: sh.id })}
                preview={<MiniButton values={values} variant={values.buttonVariant} radius={values.buttonRadius} shadow={sh.id} />}
              />
            ))}
          </div>
        </div>

        <ColorField
          label="Color de botón"
          value={values.buttonColor}
          onChange={(v) => update({ buttonColor: v, buttonTextColor: readableOn(v) })}
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
