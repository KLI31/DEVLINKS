"use client";

import { Switch } from "@/components/ui/switch";

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ToggleField({
  label,
  description,
  checked,
  onCheckedChange,
}: ToggleFieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/50 p-3">
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        {description && (
          <p className="mt-1 text-xs leading-snug text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
