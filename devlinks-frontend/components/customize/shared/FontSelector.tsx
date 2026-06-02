"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
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
  const [open, setOpen] = useState(false);

  const selectedFont = FONT_GROUPS.flatMap((g) => g.fonts).find((f) => f.id === value);

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <div
            className="flex h-9 w-full cursor-pointer items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 text-left text-xs transition-colors hover:bg-muted/50"
            role="button"
            tabIndex={0}
          >
            <span style={{ fontFamily: selectedFont?.css }}>
              {selectedFont?.label ?? "Seleccionar fuente"}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" side="bottom" align="start">
          <div className="scroll-thin max-h-72 space-y-2 overflow-y-auto pr-1">
            {FONT_GROUPS.map((group) => (
              <div key={group.tag}>
                <p className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.fonts.map((font) => {
                    const active = font.id === value;
                    return (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => {
                          onChange(font.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted/50",
                        )}
                      >
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/40 bg-background text-sm font-medium"
                          style={{ fontFamily: font.css }}
                        >
                          Ag
                        </span>
                        <span className="flex-1 text-[11px]" style={{ fontFamily: font.css }}>
                          {font.label}
                        </span>
                        {active && <Check className="size-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
