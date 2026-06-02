"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export type LinkLayout = "classic" | "featured";

interface LinkLayoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: LinkLayout;
  onChange: (layout: LinkLayout) => void;
}

export function LinkLayoutModal({
  open,
  onOpenChange,
  value,
  onChange,
}: LinkLayoutModalProps) {
  const [selected, setSelected] = useState<LinkLayout>(value);

  const handleSelect = (layout: LinkLayout) => {
    setSelected(layout);
    onChange(layout);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-6 sm:max-w-sm">
        <DialogTitle className="text-center text-base font-semibold">
          Layout
        </DialogTitle>

        <p className="text-sm text-muted-foreground">
          Elige un diseño para tu link
        </p>

        <div className="flex flex-col gap-3">
          {/* Classic */}
          <button
            type="button"
            onClick={() => handleSelect("classic")}
            className={cn(
              "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-all",
              selected === "classic"
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border/60 hover:border-primary/30 hover:bg-muted/30",
            )}
          >
            <div className="mt-0.5 shrink-0">
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border",
                  selected === "classic"
                    ? "border-primary bg-primary"
                    : "border-border",
                )}
              >
                {selected === "classic" && (
                  <Check className="size-3 text-white" />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Classic</span>
              <span className="text-xs text-muted-foreground">
                Eficiente, directo y compacto.
              </span>
              <div className="mt-2 rounded-xl bg-muted/60 px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                Mi link
              </div>
            </div>
          </button>

          {/* Featured */}
          <button
            type="button"
            onClick={() => handleSelect("featured")}
            className={cn(
              "flex cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-all",
              selected === "featured"
                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                : "border-border/60 hover:border-primary/30 hover:bg-muted/30",
            )}
          >
            <div className="mt-0.5 shrink-0">
              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border",
                  selected === "featured"
                    ? "border-primary bg-primary"
                    : "border-border",
                )}
              >
                {selected === "featured" && (
                  <Check className="size-3 text-white" />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Featured</span>
              <span className="text-xs text-muted-foreground">
                Destaca tu link con una imagen más grande y atractiva.
              </span>
              <div className="mt-2 overflow-hidden rounded-xl">
                <div className="h-[72px] w-full bg-gradient-to-br from-muted to-muted/60" />
                <div className="bg-muted/60 px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
                  Mi link
                </div>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
