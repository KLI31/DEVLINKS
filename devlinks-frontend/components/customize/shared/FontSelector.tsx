"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FontOption {
  id: string;
  label: string;
  css: string;
  tag: string;
}

const FONT_GROUPS = [
  {
    tag: "mono",
    label: "Monospace",
    fonts: [
      { id: "jetbrains-mono", label: "JetBrains Mono", css: "var(--font-jetbrains-mono), ui-monospace, monospace" },
      { id: "fira-code", label: "Fira Code", css: "var(--font-fira-code), ui-monospace, monospace" },
      { id: "mono", label: "Monospace", css: "ui-monospace, monospace" },
    ],
  },
  {
    tag: "sans",
    label: "Sans-serif",
    fonts: [
      { id: "inter", label: "Inter", css: "var(--font-inter), sans-serif" },
      { id: "poppins", label: "Poppins", css: "var(--font-poppins), sans-serif" },
      { id: "space-grotesk", label: "Space Grotesk", css: "var(--font-space-grotesk), sans-serif" },
      { id: "outfit", label: "Outfit", css: "var(--font-outfit), sans-serif" },
      { id: "dm-sans", label: "DM Sans", css: "var(--font-dm-sans), sans-serif" },
    ],
  },
  {
    tag: "serif",
    label: "Serif",
    fonts: [
      { id: "playfair", label: "Playfair Display", css: "var(--font-playfair), serif" },
      { id: "fraunces", label: "Fraunces", css: "var(--font-fraunces), serif" },
    ],
  },
];

interface FontSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function FontSelector({ value, onChange, label }: FontSelectorProps) {
  return (
    <div className="space-y-3">
      {label && (
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
      )}
      {FONT_GROUPS.map((group) => (
        <div key={group.tag} className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {group.label}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {group.fonts.map((font) => {
              const active = font.id === value;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onChange(font.id)}
                  aria-pressed={active}
                  className={cn(
                    "relative flex min-h-16 min-w-0 cursor-pointer flex-col items-start justify-center gap-0.5 rounded-xl border px-3 py-2 text-left outline-none transition-[background-color,border-color,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.97] motion-reduce:active:scale-100",
                    active
                      ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--color-primary)]"
                      : "border-border/60 hover:border-foreground/25 hover:bg-muted/30",
                  )}
                >
                  <span
                    className="text-2xl leading-none text-foreground"
                    style={{ fontFamily: font.css }}
                  >
                    Aa
                  </span>
                  <span className="w-full truncate text-[11px] text-muted-foreground">
                    {font.label}
                  </span>
                  {active && (
                    <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-primary">
                      <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
