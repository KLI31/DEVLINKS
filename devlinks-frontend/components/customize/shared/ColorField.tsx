"use client";

import { ColorPicker } from "./ColorPicker";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <ColorPicker value={value} onChange={onChange} label={label} />
  );
}
