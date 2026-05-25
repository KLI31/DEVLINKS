/**
 * Notification Factory
 *
 * Implementa el patrón Factory para crear notificaciones tipadas
 * con configuraciones predefinidas según el tipo y variante.
 *
 * Cada método factory encapsula la lógica de creación de una
 * notificación específica, asegurando consistencia en todo el sistema.
 */

import {
  createNotification,
  type ToastVariant,
  type Notification,
} from "@/store/notification-store";

interface ToastOptions {
  title: string;
  message?: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  variant?: "destructive" | "warning" | "info";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AlertOptions {
  title: string;
  message?: string;
  variant?: "info" | "warning" | "error";
  actionLabel?: string;
  onAction?: () => void;
}

/** Factory de notificaciones toast */
function createToast(variant: ToastVariant, options: ToastOptions): Notification {
  return createNotification({
    type: "toast",
    variant,
    title: options.title,
    message: options.message,
    duration: options.duration ?? 4000,
  });
}

/** Factory de notificaciones de confirmación */
function createConfirm(options: ConfirmOptions): Notification {
  return createNotification({
    type: "confirm",
    variant: options.variant ?? "warning",
    title: options.title,
    message: options.message,
    confirmLabel: options.confirmLabel ?? "Confirmar",
    cancelLabel: options.cancelLabel ?? "Cancelar",
    onConfirm: options.onConfirm,
    onCancel: options.onCancel,
  });
}

/** Factory de notificaciones de alerta */
function createAlert(options: AlertOptions): Notification {
  return createNotification({
    type: "alert",
    variant: options.variant ?? "info",
    title: options.title,
    message: options.message,
    actionLabel: options.actionLabel,
    onAction: options.onAction,
  });
}

/**
 * API pública del Factory.
 *
 * Ejemplo de uso:
 *   notify.success({ title: "¡Guardado!", message: "Tu perfil se actualizó." });
 *   notify.confirm({ title: "¿Eliminar?", onConfirm: () => deleteItem() });
 */
export const notify = {
  /** Toast de éxito */
  success: (options: ToastOptions) => createToast("success", options),

  /** Toast de error */
  error: (options: ToastOptions) => createToast("error", options),

  /** Toast de advertencia */
  warning: (options: ToastOptions) => createToast("warning", options),

  /** Toast informativo */
  info: (options: ToastOptions) => createToast("info", options),

  /** Diálogo de confirmación */
  confirm: (options: ConfirmOptions) => createConfirm(options),

  /** Diálogo de alerta */
  alert: (options: AlertOptions) => createAlert(options),

  /**
   * Confirmación para eliminar información.
   * Preconfigurado con texto y variantes apropiadas.
   */
  delete: (options: {
    title?: string;
    message?: string;
    itemName?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) =>
    createConfirm({
      title: options.title ?? "¿Eliminar?",
      message:
        options.message ??
        (options.itemName
          ? `Esta acción eliminará "${options.itemName}" permanentemente. No se puede deshacer.`
          : "Esta acción no se puede deshacer."),
      variant: "destructive",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
    }),
};
