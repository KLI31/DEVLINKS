"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useNotificationStore, type ToastNotification } from "@/store/notification-store";
import { cn } from "@/lib/utils";

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    iconClass: "text-emerald-500",
    border: "border-emerald-500/20",
  },
  error: {
    icon: XCircle,
    bar: "bg-destructive",
    iconClass: "text-destructive",
    border: "border-destructive/20",
  },
  warning: {
    icon: AlertTriangle,
    bar: "bg-amber-500",
    iconClass: "text-amber-500",
    border: "border-amber-500/20",
  },
  info: {
    icon: Info,
    bar: "bg-blue-500",
    iconClass: "text-blue-500",
    border: "border-blue-500/20",
  },
} as const;

function ToastItem({ toast }: { toast: ToastNotification }) {
  const remove = useNotificationStore((s) => s.remove);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const duration = toast.duration ?? 4000;
  const cfg = VARIANT_CONFIG[toast.variant];
  const Icon = cfg.icon;

  useEffect(() => {
    timerRef.current = setTimeout(() => remove(toast.id), duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [toast.id, duration, remove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.92 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "relative flex w-80 items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-lg backdrop-blur-sm",
        "bg-card/95",
        cfg.border,
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", cfg.iconClass)} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => remove(toast.id)}
        className="mt-0.5 shrink-0 cursor-pointer rounded-md p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground"
        aria-label="Cerrar notificación"
      >
        <X className="size-3.5" />
      </button>

      <motion.div
        className={cn("absolute bottom-0 left-0 h-[2px] origin-left", cfg.bar, "opacity-30")}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

export function ToastStack() {
  const notifications = useNotificationStore((s) => s.notifications);
  const toasts = notifications.filter((n): n is ToastNotification => n.type === "toast");

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="pointer-events-none fixed right-4 top-4 z-[9999] flex flex-col gap-2"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
