"use client";

import { SectionHeader } from "@/components/customize/shared/SectionHeader";
import { ColorField } from "@/components/customize/shared/ColorField";
import type { CustomizeValues } from "@/hooks/useCustomize";

interface ColorsSectionProps {
  values: CustomizeValues;
  update: (patch: Partial<CustomizeValues>) => void;
  onBack: () => void;
}

export function ColorsSection({ values, update, onBack }: ColorsSectionProps) {
  return (
    <div className="flex h-full flex-col">
      <SectionHeader title="Colores" onBack={onBack} />
      <div className="scroll-thin flex-1 space-y-4 overflow-y-auto pr-1">
        <ColorField
          label="Fondo"
          value={values.bgColor}
          onChange={(v) => update({ bgColor: v })}
        />
        <ColorField
          label="Botones"
          value={values.buttonColor}
          onChange={(v) => update({ buttonColor: v })}
        />
        <ColorField
          label="Texto de botones"
          value={values.buttonTextColor}
          onChange={(v) => update({ buttonTextColor: v })}
        />
        <ColorField
          label="Texto de la página"
          value={values.pageTextColor}
          onChange={(v) => update({ pageTextColor: v })}
        />
        <ColorField
          label="Título"
          value={values.titleColor}
          onChange={(v) => update({ titleColor: v })}
        />
      </div>
    </div>
  );
}
