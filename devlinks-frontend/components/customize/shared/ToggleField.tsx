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
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-[11px] font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
