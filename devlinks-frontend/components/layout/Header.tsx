"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Star, Sun, Moon, Monitor, LogIn, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useScrollTransparent } from "@/hooks/use-scroll-transparent";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

export function Header() {
  const isScrolled = useScrollTransparent(50);
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
        "fixed top-4 left-1/2 z-50 -translate-x-1/2",
        "w-[min(96vw,72rem)]",
        "flex items-center justify-between gap-4 rounded-full border px-3 py-2 sm:px-4",
        "transition-all duration-300 ease-out",
        isScrolled
          ? "border-border/60 bg-background/55 shadow-hover backdrop-blur-xl supports-[backdrop-filter]:bg-background/45"
          : "border-transparent bg-transparent shadow-none backdrop-blur-0",
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
          DevLinks
        </span>
      </Link>

      <div className="flex items-center gap-1.5">
        <div className="group relative">
          <a
            href="https://github.com/Nova11-Labs/devlinks"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Dale una estrella en GitHub"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "rounded-full text-muted-foreground hover:text-yellow-400",
            )}
          >
            <motion.span
              className="inline-flex"
              whileHover={{ rotate: 360, scale: 1.15 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Star className="size-4 transition-colors group-hover:fill-yellow-400" />
            </motion.span>
          </a>
          <span
            role="tooltip"
            className={cn(
              "pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 -translate-y-1 whitespace-nowrap rounded-md border border-border/60 bg-popover/95 px-2.5 py-1 text-xs font-medium text-popover-foreground opacity-0 shadow-lg backdrop-blur-xl transition-all duration-150",
              "group-hover:translate-y-0 group-hover:opacity-100",
            )}
          >
            Danos una estrellita
          </span>
        </div>

        <div className="relative" ref={themeMenuRef}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-1 rounded-full text-muted-foreground hover:text-foreground",
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

        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-1.5 rounded-full text-muted-foreground hover:text-foreground",
          )}
        >
          <LogIn className="size-4" />
          <span className="hidden sm:inline">Ingresar</span>
        </Link>

        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "sm" }),
            "rounded-full px-4 text-xs font-semibold shadow-sm",
          )}
        >
          Quiero mi DevLink
        </Link>
      </div>
    </header>
  );
}
