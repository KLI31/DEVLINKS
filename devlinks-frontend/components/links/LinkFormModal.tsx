"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, ChevronDown } from "lucide-react";
import type { LinkItem } from "@/types";
import { linkSchema, type LinkFormValues } from "@/lib/validations/link.schema";
import { linksApi } from "@/lib/api";
import { resolveErrorMessage } from "@/lib/messages";
import { useLinksStore } from "@/store/links-store";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconPicker } from "./IconPicker";
import { PLATFORM_ICONS, iconUrl } from "@/lib/icons";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import { normalizeUrl } from "@/lib/links";

const LAYOUT_OPTIONS = [
  { value: "classic", label: "Classic", hint: "Compacto y directo" },
  { value: "featured", label: "Featured", hint: "Con imagen destacada" },
] as const;

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
  const { notifySuccess, notifyError } = useNotifications();
  const isEdit = !!editingLink;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title: "",
      url: "",
      icon: undefined,
      previewImage: undefined,
      isPrimary: false,
      layout: "classic",
    },
  });

  const [showPicker, setShowPicker] = useState(false);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const lastFetchedUrl = useRef<string | null>(null);
  const iconValue = useWatch({ control, name: "icon" });
  const previewImageValue = useWatch({ control, name: "previewImage" });
  const isPrimaryValue = useWatch({ control, name: "isPrimary" });
  const layoutValue = useWatch({ control, name: "layout" });

  useEffect(() => {
    if (open) {
      if (editingLink) {
        lastFetchedUrl.current = editingLink.url;
        reset({
          title: editingLink.title,
          url: editingLink.url,
          icon: editingLink.icon ?? undefined,
          previewImage: editingLink.previewImage ?? undefined,
          isPrimary: editingLink.isPrimary,
          layout: editingLink.layout ?? "classic",
        });
      } else {
        lastFetchedUrl.current = null;
        reset({
          title: "",
          url: "",
          icon: undefined,
          previewImage: undefined,
          isPrimary: false,
          layout: "classic",
        });
      }
    }
  }, [open, editingLink, reset]);

  // Se ignora la respuesta si la URL cambió mientras se pedía, o si el modal se cerró.
  const fetchPreview = async () => {
    const url = getValues("url");
    if (!url?.startsWith("http") || getValues("isPrimary")) return;
    if (url === lastFetchedUrl.current) return;
    lastFetchedUrl.current = url;

    setIsFetchingPreview(true);
    try {
      const preview = await linksApi.getPreview(url);
      if (getValues("url") !== url) return;
      if (preview.image) {
        setValue("previewImage", preview.image, { shouldDirty: true });
      }
      if (!getValues("title") && preview.title) {
        setValue("title", preview.title.slice(0, 100), {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch {
      lastFetchedUrl.current = null;
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleUrlBlur = () => {
    const raw = getValues("url")?.trim();
    if (raw && normalizeUrl(raw) !== raw) {
      setValue("url", normalizeUrl(raw), { shouldValidate: true, shouldDirty: true });
    }
    void fetchPreview();
  };

  const handlePrimaryChange = (checked: boolean) => {
    setValue("isPrimary", checked, { shouldDirty: true });
    if (checked) {
      setValue("previewImage", undefined, { shouldDirty: true });
    } else {
      lastFetchedUrl.current = null;
      void fetchPreview();
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowPicker(false);
      lastFetchedUrl.current = null;
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
          previewImage: data.isPrimary ? undefined : data.previewImage,
          isPrimary: data.isPrimary,
          layout: data.layout,
        });
        updateLink(updated);
        notifySuccess("Link actualizado correctamente");
      } else {
        const created = await linksApi.create({
          title: data.title,
          url: data.url,
          icon: data.icon,
          previewImage: data.isPrimary ? undefined : data.previewImage,
          isPrimary: data.isPrimary,
          layout: data.layout,
        });
        addLink(created);
        notifySuccess("Link creado correctamente");
      }
      onOpenChange(false);
    } catch (err) {
      notifyError(resolveErrorMessage(err));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] w-full max-w-md overflow-y-auto overscroll-contain">
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
            <div className="relative">
              <Input
                id="url"
                placeholder="https://github.com/usuario"
                {...register("url")}
                disabled={isSubmitting}
                aria-invalid={errors.url ? "true" : "false"}
                onBlur={handleUrlBlur}
                className={cn(isFetchingPreview && "pr-10")}
              />
              {isFetchingPreview && (
                <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
            </div>
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          {previewImageValue && !isPrimaryValue && (
            <div className="flex flex-col gap-1.5">
              <Label>Vista previa</Label>
              <div className="relative overflow-hidden rounded-lg border border-border">
                <Image
                  src={previewImageValue}
                  alt="Vista previa del link"
                  width={400}
                  height={120}
                  className="h-[120px] w-full object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() =>
                    setValue("previewImage", undefined, { shouldDirty: true })
                  }
                  className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/60 px-2 py-1 text-[10px] text-white transition-colors hover:bg-black/80"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
            <div className="flex flex-col">
              <span className="text-sm font-medium">Link principal</span>
              <span className="text-xs text-muted-foreground">
                Solo muestra el icono en el perfil. Sin preview.
              </span>
            </div>
            <Switch
              checked={!!isPrimaryValue}
              onCheckedChange={handlePrimaryChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ícono (opcional)</Label>
            <button
              type="button"
              onClick={() => setShowPicker((s) => !s)}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                showPicker
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:bg-muted",
              )}
            >
              {(() => {
                const platform = iconValue
                  ? PLATFORM_ICONS.find((p) => p.slug === iconValue)
                  : null;
                return platform ? (
                  <span className="flex items-center gap-2">
                    <Image
                      src={iconUrl(platform.slug)}
                      alt={platform.label}
                      width={16}
                      height={16}
                      className="size-4 object-contain"
                      unoptimized
                    />
                    <span className="text-foreground">{platform.label}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Seleccionar plataforma</span>
                );
              })()}
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

          {!isPrimaryValue && (
            <div className="flex flex-col gap-2">
              <Label>Diseño</Label>
              <div className="grid grid-cols-2 gap-2">
                {LAYOUT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setValue("layout", option.value, { shouldDirty: true })
                    }
                    aria-pressed={layoutValue === option.value}
                    className={cn(
                      "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors",
                      layoutValue === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/50",
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-2 flex items-center gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 cursor-pointer"
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
