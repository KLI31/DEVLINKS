"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, ChevronDown } from "lucide-react";
import type { LinkItem } from "@/types";
import { linkSchema, type LinkFormValues } from "@/lib/validations/link.schema";
import { linksApi } from "@/lib/api";
import { resolveErrorMessage } from "@/lib/messages";
import { useLinksStore } from "@/store/links-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconPicker } from "./IconPicker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LinkFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingLink: LinkItem | null;
}

export function LinkFormModal({
  open,
  onOpenChange,
  editingLink,
}: LinkFormModalProps) {
  const { addLink, updateLink } = useLinksStore();
  const isEdit = !!editingLink;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormValues>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
      icon: undefined,
    },
  });

  const [showPicker, setShowPicker] = useState(false);
  const iconValue = useWatch({ control, name: "icon" });

  useEffect(() => {
    if (open) {
      if (editingLink) {
        reset({
          title: editingLink.title,
          url: editingLink.url,
          icon: editingLink.icon ?? undefined,
        });
      } else {
        reset({ title: "", url: "", icon: undefined });
      }
    }
  }, [open, editingLink, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowPicker(false);
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: LinkFormValues) => {
    try {
      if (isEdit && editingLink) {
        const updated = await linksApi.update(editingLink.id, {
          title: data.title,
          url: data.url,
          icon: data.icon,
        });
        updateLink(updated);
        toast.success("Link actualizado correctamente");
      } else {
        const created = await linksApi.create({
          title: data.title,
          url: data.url,
          icon: data.icon,
        });
        addLink(created);
        toast.success("Link creado correctamente");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono">
            {isEdit ? "Editar link" : "Nuevo link"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Mi GitHub"
              {...register("title")}
              disabled={isSubmitting}
              aria-invalid={errors.title ? "true" : "false"}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              placeholder="https://github.com/usuario"
              {...register("url")}
              disabled={isSubmitting}
              aria-invalid={errors.url ? "true" : "false"}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ícono (opcional)</Label>
            <button
              type="button"
              onClick={() => setShowPicker((s) => !s)}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                showPicker
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              <span className="text-muted-foreground">
                {iconValue ? `Plataforma seleccionada` : "Seleccionar plataforma"}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  showPicker && "rotate-180",
                )}
              />
            </button>

            <AnimatePresence>
              {showPicker && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <IconPicker
                    value={iconValue}
                    onChange={(slug) => setValue("icon", slug, { shouldDirty: true })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-2 flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-1.5 size-4 animate-spin" />}
              {isEdit ? "Guardar cambios" : "Crear link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
