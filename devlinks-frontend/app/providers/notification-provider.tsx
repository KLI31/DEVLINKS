"use client";

/**
 * Notification Provider — Observer Pattern Implementation
 *
 * Este componente actúa como el Observer principal del sistema.
 * Se suscribe al NotificationStore (Subject) y renderiza las
 * notificaciones activas según su tipo:
 *   - "toast"    → Sonner toast
 *   - "confirm"  → DeleteConfirmationDialog
 *   - "alert"    → Dialog de alerta
 *
 * El patrón Factory (notification-factory.ts) crea las notificaciones
 * que este componente observa y renderiza.
 */

import { useNotificationStore } from "@/store/notification-store";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { ToastStack } from "@/components/ui/toast-stack";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function ConfirmObserver() {
  const notifications = useNotificationStore((state) => state.notifications);
  const remove = useNotificationStore((state) => state.remove);

  const confirmNotifs = notifications.filter((n) => n.type === "confirm");

  return (
    <>
      {confirmNotifs.map((n) => {
        const confirm = n as Extract<typeof n, { type: "confirm" }>;
        return (
          <DeleteConfirmationDialog
            key={confirm.id}
            open
            onOpenChange={(open) => {
              if (!open) {
                remove(confirm.id);
                confirm.onCancel?.();
              }
            }}
            title={confirm.title}
            description={confirm.message}
            confirmLabel={confirm.confirmLabel}
            cancelLabel={confirm.cancelLabel}
            onConfirm={() => {
              remove(confirm.id);
              confirm.onConfirm();
            }}
            onCancel={() => {
              remove(confirm.id);
              confirm.onCancel?.();
            }}
          />
        );
      })}
    </>
  );
}

function AlertObserver() {
  const notifications = useNotificationStore((state) => state.notifications);
  const remove = useNotificationStore((state) => state.remove);

  const alertNotifs = notifications.filter((n) => n.type === "alert");

  return (
    <>
      {alertNotifs.map((n) => {
        const alert = n as Extract<typeof n, { type: "alert" }>;
        return (
          <Dialog
            key={alert.id}
            open
            onOpenChange={(open) => {
              if (!open) remove(alert.id);
            }}
          >
            <DialogContent showCloseButton={false} className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  {alert.title}
                </DialogTitle>
                {alert.message && (
                  <DialogDescription className="text-sm leading-relaxed">
                    {alert.message}
                  </DialogDescription>
                )}
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => remove(alert.id)}
                  className="w-full cursor-pointer sm:w-auto"
                >
                  Cerrar
                </Button>
                {alert.onAction && alert.actionLabel && (
                  <Button
                    onClick={() => {
                      remove(alert.id);
                      alert.onAction?.();
                    }}
                    className="w-full cursor-pointer sm:w-auto"
                  >
                    {alert.actionLabel}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
}

export function NotificationProvider() {
  return (
    <>
      <ToastStack />
      <ConfirmObserver />
      <AlertObserver />
    </>
  );
}
