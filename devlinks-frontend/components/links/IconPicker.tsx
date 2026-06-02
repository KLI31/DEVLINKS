"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PLATFORM_ICONS, iconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return PLATFORM_ICONS;
    const q = query.toLowerCase();
    return PLATFORM_ICONS.filter(
      (p) => p.label.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar plataforma..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
            className="cursor-pointer gap-1 text-muted-foreground"
          >
            <X className="size-3.5" />
            Quitar
          </Button>
        )}
      </div>

      <div className="grid max-h-52 grid-cols-5 gap-2 overflow-y-auto scroll-thin sm:grid-cols-7">
        <AnimatePresence initial={false}>
          {filtered.map((platform) => {
            const isSelected = value === platform.slug;
            return (
              <motion.button
                key={platform.slug}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={() => onChange(isSelected ? undefined : platform.slug)}
                className={cn(
                  "group relative flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-2 transition-colors",
                  isSelected
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-muted/30 hover:border-border hover:bg-muted",
                )}
              >
                <div className="relative flex size-8 items-center justify-center">
                  <Image
                    src={iconUrl(platform.slug)}
                    alt={platform.label}
                    width={20}
                  height={20}
                    className="size-5 object-contain"
                    unoptimized
                  />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      <Check className="size-3" />
                    </span>
                  )}
                </div>
                <span className="max-w-full truncate text-[9px] leading-tight text-muted-foreground">
                  {platform.label}
                </span>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No se encontraron plataformas.
        </p>
      )}
    </div>
  );
}
