"use client";

/**
 * Delete Confirmation Dialog
 *
 * Diálogo de confirmación especializado para eliminar información.
 * Usa el componente Dialog existente de shadcn/ui para mantener
 * consistencia visual con el resto de la aplicación.
 *
 * Patrón: Composite — se compone de primitivos Dialog + Button.
 */

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title = "¿Eliminar?",
  description,
  itemName,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                "bg-destructive/10 text-destructive",
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-semibold">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed">
            {description ??
              (itemName
                ? `Esta acción eliminará "${itemName}" permanentemente. No se puede deshacer.`
                : "Esta acción no se puede deshacer.")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleCancel} className="w-full cursor-pointer sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="w-full cursor-pointer sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
