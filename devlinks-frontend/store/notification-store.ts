/**
 * Notification Store — Observer Pattern (Subject)
 *
 * Este store actúa como el Subject central del patrón Observer.
 * Los componentes UI (NotificationProvider, toasts, dialogs) se suscriben
 * a este store y reaccionan automáticamente cuando cambia el estado.
 *
 * El patrón Factory (notification-factory.ts) se encarga de crear
 * las notificaciones con la configuración correcta antes de añadirlas
 * al store.
 */

import { create } from "zustand";

export type NotificationType = "toast" | "confirm" | "alert";
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: number;
}

export interface ToastNotification extends BaseNotification {
  type: "toast";
  variant: ToastVariant;
  duration?: number;
}

export interface ConfirmNotification extends BaseNotification {
  type: "confirm";
  variant: "destructive" | "warning" | "info";
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export interface AlertNotification extends BaseNotification {
  type: "alert";
  variant: "info" | "warning" | "error";
  actionLabel?: string;
  onAction?: () => void;
}

export type Notification =
  | ToastNotification
  | ConfirmNotification
  | AlertNotification;

interface NotificationStore {
  /** Lista de notificaciones activas — los observers se suscriben a esto */
  notifications: Notification[];
  add: (notification: Notification) => void;
  remove: (id: string) => void;
  clear: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  add: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),

  remove: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clear: () => set({ notifications: [] }),
}));

/**
 * Helper para crear notificaciones con ID auto-generado.
 * Usado internamente por la Factory.
 */
export function createNotification<
  T extends Omit<Notification, "id" | "createdAt">,
>(notification: T): Notification {
  return {
    ...notification,
    id: generateId(),
    createdAt: Date.now(),
  } as Notification;
}
