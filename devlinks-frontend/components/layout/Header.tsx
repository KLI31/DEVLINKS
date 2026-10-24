"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { BrandIcon } from "@/components/layout/BrandIcon";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function Header() {
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
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-40 h-24 bg-gradient-to-b from-background/90 via-background/60 to-transparent backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_40%,transparent)]",
        )}
      />
      <header
        className={cn(
          "fixed top-4 left-1/2 z-50 -translate-x-1/2",
          "w-[min(96vw,72rem)]",
          "flex items-center justify-between gap-4 px-3 py-2 sm:px-4",
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-full px-2 py-1 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.svg"
            alt="DevLinks"
            width={36}
            height={24}
            className="shrink-0"
            priority
          />
          <span className="hidden font-bold tracking-tight text-foreground sm:inline">
            devlinks
            <span className="animate-caret-blink text-primary" aria-hidden>
              _
            </span>
          </span>
          <span className="hidden rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
            beta
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <a
            href="https://github.com/Nova11-Labs/devlinks"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dale una estrella a DevLinks en GitHub"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden gap-1.5 rounded-full bg-card text-foreground transition-[background-color,color] sm:inline-flex",
            )}
          >
            <BrandIcon name="github" className="size-4" />
            Star
          </a>

          <div className="relative" ref={themeMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1 rounded-full text-foreground/80 hover:text-foreground",
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
                  "size-3 opacity-50 transition-transform duration-150",
                  isThemeOpen && "rotate-180",
                )}
              />
            </Button>

            <AnimatePresence>
              {isThemeOpen && (
                <motion.div
                  role="menu"
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-border/60",
                    "bg-popover/95 p-1 shadow-lg backdrop-blur-xl",
                  )}
                >
                  {themes.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      role="menuitemradio"
                      aria-checked={theme === value}
                      onClick={() => {
                        setTheme(value);
                        setIsThemeOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        theme === value
                          ? "bg-accent text-accent-foreground"
                          : "text-popover-foreground hover:bg-accent/50",
                      )}
                    >
                      <Icon className="size-4" />
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full text-foreground/80 hover:text-foreground",
            )}
          >
            Ingresar
          </Link>

          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "sm" }),
              "rounded-full px-4 text-xs font-semibold shadow-sm transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]",
            )}
          >
            Crear mi DevLink
          </Link>
        </div>
      </header>
    </>
  );
}
