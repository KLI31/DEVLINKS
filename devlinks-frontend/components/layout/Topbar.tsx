"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ShareProfileModal } from "./ShareProfileModal";

const themes = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

type TopbarProps = {
  className?: string;
};

export function Topbar({ className }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isThemeOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!themeMenuRef.current?.contains(e.target as Node)) {
        setIsThemeOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsThemeOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onEsc);
    };
  }, [isThemeOpen]);

  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between rounded-2xl  bg-background/90 px-4  ring-1 ring-black/[0.04] backdrop-blur-md transition-shadow duration-300 dark:bg-background/80   md:h-[3.75rem] md:rounded-3xl md:px-5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="DevLinks"
          width={28}
          height={18}
          className="shrink-0"
          priority
        />
        <span className="text-sm font-semibold tracking-tight text-foreground md:text-base">
          DevLinks
        </span>
      </div>

      <div className="flex items-center gap-1">
        <ShareProfileModal />

        <div className="relative" ref={themeMenuRef}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 min-h-11 gap-1 rounded-full px-3 text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground sm:min-h-10",
              isThemeOpen && "bg-accent text-foreground",
            )}
            onClick={() => setIsThemeOpen((v) => !v)}
            aria-label="Cambiar tema"
            aria-expanded={isThemeOpen}
            aria-haspopup="menu"
          >
            <span className="relative flex size-4 items-center justify-center">
              <Sun className="absolute size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </span>
            <ChevronDown
              className={cn(
                "size-3 opacity-50 transition-transform",
                isThemeOpen && "rotate-180",
              )}
            />
          </Button>

          {isThemeOpen && (
            <div
              role="menu"
              className={cn(
                "absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border/60",
                "bg-popover/95 p-1 shadow-lg backdrop-blur-xl",
              )}
            >
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={theme === value}
                  onClick={() => {
                    setTheme(value);
                    setIsThemeOpen(false);
                  }}
                  className={cn(
                    "flex w-full min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors sm:min-h-0",
                    theme === value
                      ? "bg-accent text-accent-foreground"
                      : "text-popover-foreground hover:bg-accent/50",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
