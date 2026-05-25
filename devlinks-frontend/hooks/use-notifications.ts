/**
 * useNotifications — Hook de conveniencia
 *
 * Wrapper sobre el NotificationStore que facilita el uso del sistema
 * Observer + Factory desde componentes React.
 *
 * Ejemplo:
 *   const { notifySuccess, notifyError, notifyDelete } = useNotifications();
 *
 *   notifySuccess("¡Guardado!", "Tu perfil se actualizó correctamente.");
 *   notifyError("Error", "No se pudo guardar.");
 *   notifyDelete("Mi link", () => deleteLink(id));
 */

import { useCallback } from "react";
import { useNotificationStore, createNotification } from "@/store/notification-store";
import { notify } from "@/lib/notifications/notification-factory";

export function useNotifications() {
  const add = useNotificationStore((state) => state.add);

  const notifySuccess = useCallback(
    (title: string, message?: string) => {
      add(notify.success({ title, message }));
    },
    [add],
  );

  const notifyError = useCallback(
    (title: string, message?: string) => {
      add(notify.error({ title, message }));
    },
    [add],
  );

  const notifyWarning = useCallback(
    (title: string, message?: string) => {
      add(notify.warning({ title, message }));
    },
    [add],
  );

  const notifyInfo = useCallback(
    (title: string, message?: string) => {
      add(notify.info({ title, message }));
    },
    [add],
  );

  const notifyDelete = useCallback(
    (itemName: string, onConfirm: () => void, onCancel?: () => void) => {
      add(notify.delete({ itemName, onConfirm, onCancel }));
    },
    [add],
  );

  const notifyConfirm = useCallback(
    (
      title: string,
      onConfirm: () => void,
      options?: {
        message?: string;
        variant?: "destructive" | "warning" | "info";
        confirmLabel?: string;
        cancelLabel?: string;
        onCancel?: () => void;
      },
    ) => {
      add(
        notify.confirm({
          title,
          onConfirm,
          message: options?.message,
          variant: options?.variant,
          confirmLabel: options?.confirmLabel,
          cancelLabel: options?.cancelLabel,
          onCancel: options?.onCancel,
        }),
      );
    },
    [add],
  );

  const notifyAlert = useCallback(
    (
      title: string,
      options?: {
        message?: string;
        variant?: "info" | "warning" | "error";
        actionLabel?: string;
        onAction?: () => void;
      },
    ) => {
      add(
        notify.alert({
          title,
          message: options?.message,
          variant: options?.variant,
          actionLabel: options?.actionLabel,
          onAction: options?.onAction,
        }),
      );
    },
    [add],
  );

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyDelete,
    notifyConfirm,
    notifyAlert,
    add,
  };
}
