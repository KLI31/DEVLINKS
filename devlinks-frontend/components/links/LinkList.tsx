"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import { AnimatePresence, motion } from "motion/react";
import { Link2 } from "lucide-react";
import { linksApi } from "@/lib/api";
import { resolveErrorMessage } from "@/lib/messages";
import { useLinksStore } from "@/store/links-store";
import { LinkCard } from "./LinkCard";
import { useNotifications } from "@/hooks/use-notifications";

export function LinkList() {
  const { links, setLinks } = useLinksStore();
  const { notifyError } = useNotifications();
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(links, oldIndex, newIndex);
    const previous = links;

    const withOrder = reordered.map((link, index) => ({
      ...link,
      displayOrder: index,
    }));

    setLinks(withOrder);
    setIsReordering(true);

    try {
      await linksApi.reorder(
        withOrder.map((l) => ({ id: l.id, displayOrder: l.displayOrder })),
      );
    } catch (err) {
      setLinks(previous);
      notifyError(resolveErrorMessage(err));
    } finally {
      setIsReordering(false);
    }
  };

  if (links.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center"
      >
        <Link2 className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Aún no tienes ningún link.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={links.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            <AnimatePresence initial={false} mode="popLayout">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {isReordering && (
        <p className="px-2 text-xs text-muted-foreground">
          Guardando orden...
        </p>
      )}
    </div>
  );
}
