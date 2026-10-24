"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useNotificationStore, type ToastNotification } from "@/store/notification-store";
import { cn } from "@/lib/utils";

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    accent: "bg-emerald-500",
    chip: "bg-emerald-500 text-white",
    border: "border-emerald-500/50",
  },
  error: {
    icon: XCircle,
    accent: "bg-red-500",
    chip: "bg-red-500 text-white",
    border: "border-red-500/50",
  },
  warning: {
    icon: AlertTriangle,
    accent: "bg-amber-500",
    chip: "bg-amber-500 text-white",
    border: "border-amber-500/50",
  },
  info: {
    icon: Info,
    accent: "bg-sky-500",
    chip: "bg-sky-500 text-white",
    border: "border-sky-500/50",
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
      role={toast.variant === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={cn(
        "relative flex w-full items-start gap-3.5 overflow-hidden rounded-xl border bg-white py-4 pl-4 pr-3 text-slate-900",
        "shadow-2xl shadow-black/40 sm:w-[26rem]",
        cfg.border,
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          cfg.chip,
        )}
      >
        <Icon className="size-5" />
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[15px] font-semibold leading-snug text-slate-900">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => remove(toast.id)}
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:size-6"
        aria-label="Cerrar notificación"
      >
        <X className="size-4 sm:size-3.5" />
      </button>

      <motion.div
        className={cn("absolute bottom-0 left-0 h-1 w-full origin-left", cfg.accent)}
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
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[9999] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto w-full sm:w-auto">
              <ToastItem toast={t} />
            </div>
          ))}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}
