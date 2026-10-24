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
      aria-pressed={active}
      className={cn(
        "relative flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-2xl border p-1.5 outline-none transition-[background-color,border-color,box-shadow,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.97] motion-reduce:active:scale-100",
        active
          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--color-primary)]"
          : "border-border/60 bg-transparent hover:border-foreground/25 hover:bg-muted/30",
      )}
    >
      {preview && (
        <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-xl bg-[#101216] bg-[radial-gradient(circle,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:10px_10px]">
          {preview}
        </div>
      )}
      <span className="w-full truncate px-0.5 pb-1 text-center text-[11px] font-medium text-foreground">
        {label}
      </span>
      {active && (
        <div className="absolute right-3 top-3 flex size-4 items-center justify-center rounded-full bg-primary shadow-sm">
          <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
