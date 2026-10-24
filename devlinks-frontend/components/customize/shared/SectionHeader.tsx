"use client";

import { ChevronLeft } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  onBack: () => void;
}

export function SectionHeader({ title, onBack }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        aria-label="Volver"
      >
        <ChevronLeft className="size-4" />
      </button>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}
