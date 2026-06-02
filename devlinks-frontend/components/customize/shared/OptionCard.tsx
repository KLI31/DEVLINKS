"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  label: string;
  active: boolean;
  onClick: () => void;
  preview?: React.ReactNode;
}

export function OptionCard({
  label,
  active,
  onClick,
  preview,
}: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-150",
        active
          ? "border-primary/60 bg-primary/10"
          : "border-border/50 bg-transparent hover:border-border",
      )}
    >
      {preview && (
        <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-lg">
          {preview}
        </div>
      )}
      <span className="w-full truncate text-center text-[11px] font-semibold text-foreground/70">
        {label}
      </span>
      {active && (
        <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary shadow-sm">
          <Check className="size-3 text-white" />
        </div>
      )}
    </button>
  );
}
