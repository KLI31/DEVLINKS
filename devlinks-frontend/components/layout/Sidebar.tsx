"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";
import { tooltipAnimation } from "@/lib/animations";
import {
  Home,
  Link2,
  BarChart3,
  Palette,
  FileJson,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

type IconEntry = { id: string; icon: LucideIcon; href: string; label: string };

const navItems: IconEntry[] = [
  { id: "home", icon: Home, href: "/dashboard", label: "Inicio" },
  { id: "links", icon: Link2, href: "/dashboard/links", label: "Links" },
  {
    id: "analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    label: "Analíticas",
  },
  {
    id: "customize",
    icon: Palette,
    href: "/dashboard/customize",
    label: "Personalización",
  },
  { id: "import", icon: FileJson, href: "/dashboard/import", label: "Importar / Exportar" },
  {
    id: "settings",
    icon: Settings,
    href: "/dashboard/settings",
    label: "Ajustes",
  },
];

function NavTooltip({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTooltipStyle({
        position: "fixed",
        left: `${rect.right + 10}px`,
        top: `${rect.top + rect.height / 2}px`,
        transform: "translateY(-50%)",
        zIndex: 100,
      });
    }
    setShow(true);
  };

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            style={tooltipStyle}
            initial={tooltipAnimation.initial}
            animate={tooltipAnimation.animate}
            exit={tooltipAnimation.exit}
            transition={tooltipAnimation.transition}
          >
            <div className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-popover/95 px-2.5 py-1.5 text-popover-foreground shadow-[var(--shadow-card)] backdrop-blur-sm">
              <span className="whitespace-nowrap text-xs font-medium">
                {label}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  if (!user) return null;

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Tu cuenta"
        className="relative overflow-visible rounded-full ring-2 transition-[box-shadow,transform] hover:scale-[1.03] hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="h-10 w-10 overflow-hidden rounded-full  shadow-sm">
          {user.avatarUrl && (
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
          )}
          <AvatarFallback className="bg-muted text-sm font-medium text-muted-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        {user.githubUsername && (
          <span
            aria-hidden
            className="absolute -right-1 -bottom-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#24292e] ring-2 ring-background"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-2.5 w-2.5 text-white"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={8}
        className="w-72 rounded-xl border border-border/70 bg-popover p-3.5 text-popover-foreground shadow-[var(--shadow-card)]"
      >
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 overflow-hidden rounded-full">
              {user.avatarUrl && (
                <AvatarImage
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="rounded-full"
                />
              )}
              <AvatarFallback className="bg-muted text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{user.displayName}</span>
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>

          {user.githubUsername && (
            <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-muted/55 px-3 py-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm ring-1 ring-border/60">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">Conectado con GitHub</p>
                <p className="truncate text-sm text-muted-foreground">
                  @{user.githubUsername}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Activo
              </span>
            </div>
          )}

          <div className="h-px bg-border" />
          <Button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm bg-red-500 text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegación"
      className="flex h-full min-h-0 w-[4.5rem] shrink-0 flex-col md:w-20"
    >
      <div className="flex h-full max-h-[calc(100dvh-7.5rem)] min-h-[17rem] flex-col items-center justify-between overflow-y-auto scroll-thin rounded-2xl border border-border/70 bg-background px-2.5 py-5 shadow-[var(--shadow-card)] ring-1 ring-black/[0.04] transition-shadow duration-300 dark:ring-white/[0.06] md:rounded-3xl md:px-3">
        <div className="flex flex-col items-center gap-1">
          <nav className="mt-4 flex flex-col items-center gap-2.5">
            {navItems.map(({ id, icon: Icon, href, label }) => {
              const isActive =
                pathname === href ||
                (href !== "/dashboard" && pathname?.startsWith(href));
              return (
                <NavTooltip key={id} label={label}>
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      href={href}
                      aria-label={label}
                      className={cn(
                        "flex h-11 w-11 items-center justify-center transition-all duration-200",
                        "text-muted-foreground hover:bg-accent hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "rounded-full bg-primary text-white shadow-[var(--shadow-hover)] hover:bg-primary/90 hover:text-white"
                          : "rounded-xl",
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </Link>
                  </motion.div>
                </NavTooltip>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col items-center pt-20">
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
