"use client";

import { ChevronLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  onBack: () => void;
}

export function SectionHeader({ title, onBack }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <button
        type="button"
        onClick={onBack}
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border/50 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label="Volver"
      >
        <ChevronLeft className="size-4" />
      </button>
      <p className="text-sm font-semibold text-foreground">{title}</p>
    </div>
  );
}
