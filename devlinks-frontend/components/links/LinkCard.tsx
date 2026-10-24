"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CalendarClock,
  GripVertical,
  ImageIcon,
  LayoutTemplate,
  Link2,
  Loader2,
  MousePointerClick,
  Star,
  Trash2,
} from "lucide-react";
import type { LinkItem, UpdateLinkPayload } from "@/types";
import { linksApi } from "@/lib/api";
import { iconUrl } from "@/lib/icons";
import {
  formatSchedule,
  getScheduleState,
  normalizeUrl,
  toLocalInput,
} from "@/lib/links";
import { resolveErrorMessage } from "@/lib/messages";
import { cn } from "@/lib/utils";
import { useLinksStore } from "@/store/links-store";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { IconPicker } from "./IconPicker";

interface LinkCardProps {
  link: LinkItem;
}

const LAYOUTS = [
  { value: "classic", label: "Classic", hint: "Compacto y directo" },
  { value: "featured", label: "Featured", hint: "Con imagen destacada" },
] as const;

const actionBtn =
  "flex size-11 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:size-9";

// Campo de texto que se edita al hacer click; guarda en blur/Enter y cancela con Esc.
function InlineField({
  value,
  label,
  placeholder,
  className,
  transform,
  validate,
  onSave,
}: {
  value: string;
  label: string;
  placeholder: string;
  className?: string;
  transform?: (v: string) => string;
  validate?: (v: string) => boolean;
  onSave: (v: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const cancelled = useRef(false);

  const commit = async () => {
    if (cancelled.current) {
      cancelled.current = false;
      setEditing(false);
      return;
    }
    const next = (transform ? transform(draft) : draft).trim();
    setEditing(false);
    if (!next || next === value || (validate && !validate(next))) {
      setDraft(value);
      return;
    }
    try {
      await onSave(next);
    } catch {
      setDraft(value);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        aria-label={`Editar ${label}`}
        className={cn(
          "block min-h-6 w-full cursor-text truncate rounded-md px-1.5 text-left transition-colors hover:bg-muted/60",
          className,
        )}
      >
        {value || <span className="text-muted-foreground">{placeholder}</span>}
      </button>
    );
  }

  return (
    <Input
      autoFocus
      value={draft}
      aria-label={label}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          cancelled.current = true;
          e.currentTarget.blur();
        }
      }}
      className="h-7 px-1.5 text-sm"
    />
  );
}

function isHttpUrl(v: string) {
  try {
    return ["http:", "https:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
}

export function LinkCard({ link }: LinkCardProps) {
  const { updateLink, removeLink } = useLinksStore();
  const { notifyError, notifySuccess, notifyDelete } = useNotifications();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [start, setStart] = useState(toLocalInput(link.scheduledStart));
  const [end, setEnd] = useState(toLocalInput(link.scheduledEnd));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const schedule = getScheduleState(link);

  const save = async (patch: UpdateLinkPayload, okMessage?: string) => {
    try {
      updateLink(await linksApi.update(link.id, patch));
      if (okMessage) notifySuccess(okMessage);
    } catch (err) {
      notifyError(resolveErrorMessage(err));
      throw err;
    }
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      updateLink(await linksApi.toggle(link.id));
    } catch (err) {
      notifyError(resolveErrorMessage(err));
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = () => {
    notifyDelete(link.title, async () => {
      setIsDeleting(true);
      try {
        await linksApi.remove(link.id);
        removeLink(link.id);
        notifySuccess("Link eliminado");
      } catch (err) {
        notifyError(resolveErrorMessage(err));
        setIsDeleting(false);
      }
    });
  };

  const saveSchedule = (clear = false) => {
    const s = clear || !start ? null : new Date(start).toISOString();
    const e = clear || !end ? null : new Date(end).toISOString();
    if (s && e && e <= s) {
      notifyError("La fecha de fin debe ser posterior a la de inicio");
      return;
    }
    if (clear) {
      setStart("");
      setEnd("");
    }
    void save(
      { scheduledStart: s, scheduledEnd: e },
      clear ? "Programación quitada" : "Programación guardada",
    ).catch(() => {});
  };

  // dnd-kit y motion escriben `transform`: cada uno vive en su propio nodo para que no se pisen.
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative", isDragging && "z-50")}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "flex gap-1 rounded-[18px] border bg-card p-2.5 transition-[border-color,box-shadow,opacity]",
          isDragging
            ? "border-primary/40 shadow-lg"
            : "border-border/60 hover:border-border",
          (!link.isActive || schedule === "expired") && "opacity-60",
        )}
      >
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Arrastrar para reordenar"
          className={cn(
            "flex size-11 shrink-0 cursor-grab touch-none items-center justify-center self-start rounded-lg text-muted-foreground/50 transition-colors hover:text-foreground md:size-9",
            isDragging && "cursor-grabbing text-primary",
          )}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              {link.icon ? (
                <Image
                  src={iconUrl(link.icon)}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                  unoptimized
                />
              ) : (
                <Link2 className="size-4 text-muted-foreground" />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <InlineField
                value={link.title}
                label="título"
                placeholder="Título"
                className="text-sm font-semibold"
                onSave={(title) => save({ title }, "Título actualizado")}
              />
              <InlineField
                value={link.url}
                label="URL"
                placeholder="https://"
                className="font-mono text-xs text-muted-foreground"
                transform={normalizeUrl}
                validate={(v) => {
                  if (isHttpUrl(v)) return true;
                  notifyError("Introduce una URL válida");
                  return false;
                }}
                onSave={(url) => save({ url }, "URL actualizada")}
              />
            </div>

            <div className="flex shrink-0 items-center">
              <div className="flex size-11 items-center justify-center md:size-9">
                {isToggling ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <Switch
                    checked={link.isActive}
                    onCheckedChange={handleToggle}
                    aria-label={link.isActive ? "Desactivar link" : "Activar link"}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 pl-[3.25rem]">
            <Popover>
              <PopoverTrigger
                aria-label="Diseño del link"
                title="Diseño"
                className={cn(actionBtn, link.layout === "featured" && "text-primary")}
              >
                <LayoutTemplate className="size-4" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 gap-2 p-2">
                {LAYOUTS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={link.layout === option.value}
                    onClick={() =>
                      link.layout !== option.value &&
                      void save({ layout: option.value }).catch(() => {})
                    }
                    className={cn(
                      "flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors",
                      link.layout === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:bg-muted/50",
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.hint}</span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger
                aria-label="Ícono e imagen"
                title="Ícono e imagen"
                className={cn(actionBtn, link.icon && "text-primary")}
              >
                <ImageIcon className="size-4" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80 gap-3 p-3">
                <IconPicker
                  value={link.icon ?? undefined}
                  onChange={(icon) => icon && void save({ icon }).catch(() => {})}
                />
                {link.previewImage && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 cursor-pointer"
                    onClick={() =>
                      void save({ previewImage: "" }, "Imagen quitada").catch(() => {})
                    }
                  >
                    Quitar imagen de vista previa
                  </Button>
                )}
              </PopoverContent>
            </Popover>

            <button
              type="button"
              aria-label={link.isPrimary ? "Quitar como principal" : "Marcar como principal"}
              aria-pressed={link.isPrimary}
              title="Link principal"
              onClick={() =>
                void save(
                  link.isPrimary
                    ? { isPrimary: false }
                    : { isPrimary: true, previewImage: "" },
                ).catch(() => {})
              }
              className={cn(actionBtn, link.isPrimary && "text-primary")}
            >
              <Star className={cn("size-4", link.isPrimary && "fill-current")} />
            </button>

            <Popover>
              <PopoverTrigger
                aria-label="Programar link"
                title="Programar"
                className={cn(actionBtn, schedule !== "none" && "text-primary")}
              >
                <CalendarClock className="size-4" />
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 gap-3 p-3">
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Mostrar desde
                  <Input
                    type="datetime-local"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    className="h-9 text-sm text-foreground"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                  Ocultar desde
                  <Input
                    type="datetime-local"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                    className="h-9 text-sm text-foreground"
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 flex-1 cursor-pointer"
                    onClick={() => saveSchedule(true)}
                    disabled={schedule === "none" && !start && !end}
                  >
                    Quitar
                  </Button>
                  <Button
                    type="button"
                    className="h-9 flex-1 cursor-pointer"
                    onClick={() => saveSchedule()}
                  >
                    Guardar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <span
              title="Clics totales"
              className="ml-1 inline-flex h-7 items-center gap-1.5 rounded-full bg-muted px-2.5 font-mono text-xs tabular-nums text-muted-foreground"
            >
              <MousePointerClick className="size-3.5" />
              {link.clicksCount}
            </span>

            {link.isPrimary && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Principal
              </span>
            )}
            {!link.isPrimary && link.layout === "featured" && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Featured
              </span>
            )}
            {schedule === "scheduled" && link.scheduledStart && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Programado · {formatSchedule(link.scheduledStart)}
              </span>
            )}
            {schedule === "live" && link.scheduledEnd && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Hasta {formatSchedule(link.scheduledEnd)}
              </span>
            )}
            {schedule === "expired" && (
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                Expirado
              </span>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-label="Eliminar link"
              className={cn(
                actionBtn,
                "ml-auto hover:bg-destructive/10 hover:text-destructive disabled:cursor-default",
              )}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
