"use client";

import { useState } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import {
  Pencil,
  Trash2,
  Loader2,
  Link2,
  GripVertical,
} from "lucide-react";
import type { LinkItem } from "@/types";
import { linksApi } from "@/lib/api";
import { resolveErrorMessage } from "@/lib/messages";
import { useLinksStore } from "@/store/links-store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { iconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LinkCardProps {
  link: LinkItem;
  index: number;
  onEdit: (link: LinkItem) => void;
}

export function LinkCard({ link, index, onEdit }: LinkCardProps) {
  const { updateLink, removeLink } = useLinksStore();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const updated = await linksApi.toggle(link.id);
      updateLink(updated);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este link? Esta acción no se puede deshacer."))
      return;
    setIsDeleting(true);
    try {
      await linksApi.remove(link.id);
      removeLink(link.id);
      toast.success("Link eliminado");
    } catch (err) {
      toast.error(resolveErrorMessage(err));
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={
        isDragging
          ? undefined
          : {
              y: -4,
              rotate: [0, -1, 1, -0.5, 0],
              scale: 1.01,
              transition: { duration: 0.35, ease: "easeOut" },
            }
      }
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-border/70",
        "bg-card p-4 shadow-[var(--shadow-card)] transition-shadow",
        isDragging &&
          "z-50 scale-[1.02] border-primary/50 shadow-[var(--shadow-hover)] ring-1 ring-primary/20",
        !link.isActive && "opacity-55",
      )}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          aria-label="Arrastrar para reordenar"
          className={cn(
            "flex shrink-0 flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors",
            "cursor-grab text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground active:cursor-grabbing",
            isDragging && "cursor-grabbing text-primary",
          )}
        >
          <GripVertical className="size-4" />
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
            {index + 1}
          </span>
        </button>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-sm font-semibold">{link.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {link.url}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/40 pt-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40">
            {link.previewImage ? (
              <Image
                src={link.previewImage}
                alt={link.title}
                width={32}
                height={32}
                className="size-8 rounded-[6px] object-cover"
                unoptimized
              />
            ) : link.icon ? (
              <Image
                src={iconUrl(link.icon)}
                alt={link.title}
                width={18}
                height={18}
                className="size-[18px] object-contain"
                unoptimized
              />
            ) : (
              <Link2 className="size-[18px] text-muted-foreground" />
            )}
          </div>
          {link.isPrimary && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              Principal
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
              link.isActive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}
          >
            {link.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isToggling ? (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={link.isActive}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            />
          )}

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onEdit(link)}
            aria-label="Editar link"
            className="h-7 w-7"
          >
            <Pencil className="size-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Eliminar link"
            className="h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
