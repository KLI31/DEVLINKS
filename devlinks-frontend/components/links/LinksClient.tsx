"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import type { LinkItem } from "@/types";
import { useLinksStore } from "@/store/links-store";
import { Button } from "@/components/ui/button";
import { LinkList } from "./LinkList";
import { LinkFormModal } from "./LinkFormModal";

interface LinksClientProps {
  initialLinks: LinkItem[];
}

export function LinksClient({ initialLinks }: LinksClientProps) {
  const { links, setLinks } = useLinksStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks, setLinks]);

  const handleAdd = () => {
    setEditingLink(null);
    setSheetOpen(true);
  };

  const handleEdit = (link: LinkItem) => {
    setEditingLink(link);
    setSheetOpen(true);
  };

  const isLimitReached = links.length >= 20;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-1 flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Enlaces</h1>
          <motion.span
            key={links.length}
            initial={prefersReducedMotion ? false : { scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="font-mono text-sm text-muted-foreground"
          >
            {links.length} / 20
          </motion.span>
        </div>

        {isLimitReached ? (
          <Button disabled className="gap-1.5" title="Límite alcanzado">
            <Plus className="size-4" />
            Agregar link
          </Button>
        ) : (
          <Button onClick={handleAdd} className="gap-1.5">
            <Plus className="size-4" />
            Agregar link
          </Button>
        )}
      </div>

      <LinkList onEdit={handleEdit} />

      <LinkFormModal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editingLink={editingLink}
      />
    </motion.div>
  );
}
