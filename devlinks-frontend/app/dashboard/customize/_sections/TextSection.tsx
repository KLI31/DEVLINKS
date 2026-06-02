"use client";

import { SectionHeader } from "@/components/customize/shared/SectionHeader";
import { ToggleField } from "@/components/customize/shared/ToggleField";
import { FontSelector } from "@/components/customize/shared/FontSelector";
import type { CustomizeValues } from "@/hooks/useCustomize";

interface TextSectionProps {
  values: CustomizeValues;
  update: (patch: Partial<CustomizeValues>) => void;
  onBack: () => void;
}

export function TextSection({ values, update, onBack }: TextSectionProps) {
  return (
    <div className="flex h-full flex-col">
      <SectionHeader title="Texto" onBack={onBack} />
      <div className="scroll-thin flex-1 space-y-5 overflow-y-auto pr-1">
        <FontSelector
          label="Fuente de la página"
          value={values.fontFamily}
          onChange={(id) => update({ fontFamily: id })}
        />

        <div className="space-y-3">
          <ToggleField
            label="Fuente alternativa para título"
            description="Usa una fuente distinta solo para el título"
            checked={values.altTitleFont}
            onCheckedChange={(v) => update({ altTitleFont: v })}
          />

          {values.altTitleFont && (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
              <FontSelector
                label="Fuente del título"
                value={values.titleFont}
                onChange={(id) => update({ titleFont: id })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
