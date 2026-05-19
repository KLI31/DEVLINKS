"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { Pencil, Trash2, Loader2, Link2, LayoutTemplate } from "lucide-react";
import type { LinkItem } from "@/types";
import { linksApi } from "@/lib/api";
import { resolveErrorMessage } from "@/lib/messages";
import { useLinksStore } from "@/store/links-store";
import { Switch } from "@/components/ui/switch";
import { iconUrl } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LinkLayoutModal } from "./LinkLayoutModal";

function DragHandleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" className={className}>
      <circle cx="2" cy="2" r="1.2" />
      <circle cx="6" cy="2" r="1.2" />
      <circle cx="10" cy="2" r="1.2" />
      <circle cx="2" cy="6" r="1.2" />
      <circle cx="6" cy="6" r="1.2" />
      <circle cx="10" cy="6" r="1.2" />
      <circle cx="2" cy="10" r="1.2" />
      <circle cx="6" cy="10" r="1.2" />
      <circle cx="10" cy="10" r="1.2" />
    </svg>
  );
}

interface LinkCardProps {
  link: LinkItem;
}

export function LinkCard({ link }: LinkCardProps) {
  const { updateLink, removeLink } = useLinksStore();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [titleEditing, setTitleEditing] = useState(false);
  const [urlEditing, setUrlEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState(link.title);
  const [urlDraft, setUrlDraft] = useState(link.url);
  const titleRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

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
    if (!confirm("¿Eliminar este link? Esta acción no se puede deshacer.")) return;
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

  const saveField = async (field: "title" | "url", value: string) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === link[field]) return;
    setIsSaving(true);
    try {
      const updated = await linksApi.update(link.id, { [field]: trimmed });
      updateLink(updated);
    } catch (err) {
      toast.error(resolveErrorMessage(err));
      if (field === "title") setTitleDraft(link.title);
      else setUrlDraft(link.url);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleEdit = () => {
    setTitleDraft(link.title);
    setTitleEditing(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  };

  const handleTitleBlur = async () => {
    setTitleEditing(false);
    await saveField("title", titleDraft);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); titleRef.current?.blur(); }
    if (e.key === "Escape") { setTitleDraft(link.title); setTitleEditing(false); }
  };

  const handleUrlEdit = () => {
    setUrlDraft(link.url);
    setUrlEditing(true);
    setTimeout(() => urlRef.current?.focus(), 0);
  };

  const handleUrlBlur = async () => {
    setUrlEditing(false);
    await saveField("url", urlDraft);
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); urlRef.current?.blur(); }
    if (e.key === "Escape") { setUrlDraft(link.url); setUrlEditing(false); }
  };

  const handleLayoutChange = (layout: "classic" | "featured") => {
    linksApi
      .update(link.id, { layout })
      .then((updated) => updateLink(updated))
      .catch((err) => toast.error(resolveErrorMessage(err)));
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm transition-shadow dark:bg-card",
        isDragging
          ? "z-50 scale-[1.02] border-primary/40 shadow-lg ring-1 ring-primary/20"
          : "border-border/60 hover:shadow-md",
        !link.isActive && "opacity-55",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Arrastrar para reordenar"
        className={cn(
          "flex shrink-0 cursor-grab items-center rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-muted hover:text-muted-foreground",
          isDragging && "cursor-grabbing text-primary",
        )}
      >
        <DragHandleIcon className="size-4" />
      </button>

      <div className="flex shrink-0 items-center justify-center">
        {link.icon ? (
          <Image
            src={iconUrl(link.icon)}
            alt={link.title}
            width={20}
            height={20}
            className="size-5 object-contain"
            unoptimized
          />
        ) : (
          <Link2 className="size-5 text-muted-foreground/50" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          {titleEditing ? (
            <input
              ref={titleRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="w-full rounded border border-primary/40 bg-muted/50 px-2 py-0.5 text-sm font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary/30"
            />
          ) : (
            <>
              <span className="truncate text-sm font-semibold text-foreground">
                {link.title}
              </span>
              <button
                type="button"
                onClick={handleTitleEdit}
                className="shrink-0 opacity-0 text-muted-foreground/60 transition-all group-hover:opacity-100 hover:text-primary"
                aria-label="Editar título"
              >
                <Pencil className="size-3" />
              </button>
              {link.isPrimary && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  Principal
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {urlEditing ? (
            <input
              ref={urlRef}
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onBlur={handleUrlBlur}
              onKeyDown={handleUrlKeyDown}
              className="w-full rounded border border-primary/40 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground outline-none focus:ring-1 focus:ring-primary/30"
            />
          ) : (
            <>
              <span className="truncate text-xs text-muted-foreground">
                {link.url}
              </span>
              <button
                type="button"
                onClick={handleUrlEdit}
                className="shrink-0 opacity-0 text-muted-foreground/60 transition-all group-hover:opacity-100 hover:text-primary"
                aria-label="Editar URL"
              >
                <Pencil className="size-3" />
              </button>
            </>
          )}
        </div>

        <div className="mt-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLayoutModalOpen(true)}
            className="flex items-center rounded-md px-1.5 py-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Cambiar layout"
            title={link.layout === "featured" ? "Featured" : "Classic"}
          >
            <LayoutTemplate className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isSaving && (
          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
        )}
        {isToggling ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            checked={link.isActive}
            onCheckedChange={handleToggle}
            disabled={isToggling}
          />
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Eliminar link"
          className="rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>

      <LinkLayoutModal
        open={layoutModalOpen}
        onOpenChange={setLayoutModalOpen}
        value={link.layout ?? "classic"}
        onChange={handleLayoutChange}
      />
    </motion.div>
  );
}
