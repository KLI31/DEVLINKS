"use client";

import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { useState, useRef, useSyncExternalStore } from "react";
import { tooltipAnimation } from "@/lib/animations";
import {
  Home,
  Link2,
  BarChart3,
  Palette,
  FileJson,
  Settings,
  LogOut,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
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

type IconEntry = {
  id: string;
  icon: LucideIcon;
  href: string;
  label: string;
  section: "main" | "tools" | "footer";
};

const navItems: IconEntry[] = [
  {
    id: "home",
    icon: Home,
    href: "/dashboard",
    label: "Inicio",
    section: "main",
  },
  {
    id: "links",
    icon: Link2,
    href: "/dashboard/links",
    label: "Links",
    section: "main",
  },
  {
    id: "analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
    label: "Analíticas",
    section: "main",
  },
  {
    id: "customize",
    icon: Palette,
    href: "/dashboard/customize",
    label: "Personalización",
    section: "main",
  },
  {
    id: "import",
    icon: FileJson,
    href: "/dashboard/import",
    label: "Importar / Exportar",
    section: "tools",
  },
  {
    id: "settings",
    icon: Settings,
    href: "/dashboard/settings",
    label: "Ajustes",
    section: "footer",
  },
];

const COLLAPSED_KEY = "sidebar-collapsed";

const indicatorTransition = {
  type: "spring",
  stiffness: 500,
  damping: 38,
} as const;

// El layout no cambia al colapsar: solo el ancho del aside (que recorta) y la
// opacidad del texto. Al expandir, el texto aparece cuando ya hay espacio.
function fade(collapsed: boolean) {
  return cn(
    "opacity-0 transition-opacity duration-150 ease-out motion-reduce:transition-none",
    !collapsed && "lg:opacity-100 lg:delay-100",
  );
}

// Preferencia por navegador; en SSR se asume expandido para evitar mismatch.
function subscribeCollapsed(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function setCollapsedPref(value: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  } catch {}
  window.dispatchEvent(new StorageEvent("storage", { key: COLLAPSED_KEY }));
}

function NavTooltip({
  children,
  label,
  collapsed,
}: {
  children: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  const [show, setShow] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});

  const handleMouseEnter = () => {
    if (!collapsed && window.matchMedia("(min-width: 1024px)").matches) return;
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

function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    // Navegación completa: limpia todos los stores en memoria y el Router
    // Cache de Next, garantizando que el middleware revalide la sesión.
    window.location.replace("/login");
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
        className={cn(
          "group flex w-full items-center gap-2.5 rounded-xl p-0.5 transition-colors duration-150 hover:bg-card/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
      >
        <span className="relative shrink-0">
          <Avatar className="h-10 w-10 overflow-hidden rounded-full shadow-sm">
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
        </span>
        <span
          className={cn(
            "flex min-w-0 flex-1 flex-col text-left",
            fade(collapsed),
          )}
        >
          <span className="truncate text-sm font-medium text-foreground">
            {user.displayName}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {user.githubUsername ? `@${user.githubUsername}` : user.email}
          </span>
        </span>
        <ChevronsUpDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            fade(collapsed),
          )}
        />
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
                <svg
                  viewBox="0 0 24 24"
                  className="h-4.5 w-4.5"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">
                  Conectado con GitHub
                </p>
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

export function getNavLabel(pathname: string | null) {
  return (
    navItems.find(
      ({ href }) => href !== "/dashboard" && pathname?.startsWith(href),
    )?.label ?? navItems[0].label
  );
}

type NavLinkProps = IconEntry & {
  collapsed: boolean;
  isHovered: boolean;
  onHover: (id: string) => void;
};

function NavLink({
  id,
  icon: Icon,
  href,
  label,
  collapsed,
  isHovered,
  onHover,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

  return (
    <NavTooltip label={label} collapsed={collapsed}>
      <Link
        href={href}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
        onMouseEnter={() => onHover(id)}
        onFocus={() => onHover(id)}
        className={cn(
          "group relative flex h-11 w-full items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-medium",
          "transition-[color,scale] duration-150 ease-out motion-safe:active:scale-[0.96]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {isActive && (
          <motion.span
            layoutId="sidebar-active"
            transition={indicatorTransition}
            className="absolute inset-0 rounded-xl bg-card shadow-[var(--shadow-card)]"
          />
        )}
        {isHovered && !isActive && (
          <motion.span
            layoutId="sidebar-hover"
            transition={indicatorTransition}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-xl bg-card/60"
          />
        )}
        <Icon
          className={cn(
            "relative size-5 shrink-0 transition-transform duration-200 ease-out motion-safe:group-hover:scale-110",
            isActive && "text-primary",
          )}
          strokeWidth={1.75}
        />
        <span
          className={cn(
            "relative whitespace-nowrap",
            fade(collapsed),
          )}
        >
          {label}
        </span>
      </Link>
    </NavTooltip>
  );
}

export function Sidebar() {
  const collapsed = useSyncExternalStore(
    subscribeCollapsed,
    getCollapsed,
    () => false,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const main = navItems.filter((i) => i.section === "main");
  const tools = navItems.filter((i) => i.section === "tools");
  const footer = navItems.filter((i) => i.section === "footer");

  const renderLink = (item: IconEntry) => (
    <NavLink
      key={item.id}
      {...item}
      collapsed={collapsed}
      isHovered={hoveredId === item.id}
      onHover={setHoveredId}
    />
  );

  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <MotionConfig reducedMotion="user">
      <aside
        aria-label="Navegación"
        className={cn(
          "scroll-thin flex h-full w-[3.75rem] shrink-0 flex-col overflow-y-auto overflow-x-hidden px-2 py-2",
          "transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          !collapsed && "lg:w-60",
        )}
      >
        <div className="group/header relative flex h-11 shrink-0 items-center">
          <Link
            href="/dashboard"
            className={cn(
              "flex h-11 min-w-0 items-center gap-2.5 rounded-xl px-2 transition-opacity duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              collapsed &&
                "lg:group-hover/header:opacity-0 lg:group-has-[button:focus-visible]/header:opacity-0",
            )}
          >
            <Image
              src="/logo.svg"
              alt="DevLinks"
              width={28}
              height={18}
              className="shrink-0"
              priority
            />
            <span
              className={cn(
                "whitespace-nowrap text-base font-semibold tracking-tight text-foreground",
                fade(collapsed),
              )}
            >
              DevLinks
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsedPref(!collapsed)}
            aria-label={
              collapsed ? "Expandir barra lateral" : "Contraer barra lateral"
            }
            aria-expanded={!collapsed}
            className={cn(
              "absolute top-1 right-1 hidden size-9 items-center justify-center rounded-lg text-muted-foreground transition-[opacity,background-color,color,scale] duration-150 ease-out hover:bg-card/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-safe:active:scale-[0.94] lg:flex",
              collapsed &&
                "opacity-0 group-hover/header:opacity-100 focus-visible:opacity-100",
            )}
          >
            <ToggleIcon className="size-4.5" strokeWidth={1.75} />
          </button>
        </div>

        <nav
          onMouseLeave={() => setHoveredId(null)}
          onBlur={() => setHoveredId(null)}
          className="mt-6 flex flex-1 flex-col gap-1"
        >
          {main.map(renderLink)}

          <div className="mx-2 my-4 h-px bg-border/70" />
          <p
            className={cn(
              "px-3 pb-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap text-muted-foreground",
              fade(collapsed),
            )}
          >
            Herramientas
          </p>
          {tools.map(renderLink)}

          <div className="mt-auto flex flex-col gap-1 pt-6">
            {footer.map(renderLink)}
            <div className="mx-2 my-3 h-px bg-border/70" />
            <UserMenu collapsed={collapsed} />
          </div>
        </nav>
      </aside>
    </MotionConfig>
  );
}
