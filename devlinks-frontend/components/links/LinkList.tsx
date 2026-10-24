"use client";

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
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { AnimatePresence, motion } from "motion/react";
import { Link2, Plus } from "lucide-react";
import { linksApi } from "@/lib/api";
import { resolveErrorMessage } from "@/lib/messages";
import { useLinksStore } from "@/store/links-store";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { LinkCard } from "./LinkCard";

interface LinkListProps {
  onAdd: () => void;
}

export function LinkList({ onAdd }: LinkListProps) {
  const { links, setLinks } = useLinksStore();
  const { notifyError } = useNotifications();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex((l) => l.id === active.id);
    const newIndex = links.findIndex((l) => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previous = links;
    const reordered = arrayMove(links, oldIndex, newIndex).map((link, index) => ({
      ...link,
      displayOrder: index,
    }));

    setLinks(reordered);

    try {
      await linksApi.reorder(
        reordered.map((l) => ({ id: l.id, displayOrder: l.displayOrder })),
      );
    } catch (err) {
      setLinks(previous);
      notifyError(resolveErrorMessage(err));
    }
  };

  if (links.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-col items-center gap-4 rounded-[18px] border border-dashed border-border py-14 text-center"
      >
        <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
          <Link2 className="size-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Aún no tienes links</p>
          <p className="text-xs text-muted-foreground">
            Agrega tu GitHub, portfolio o redes para empezar.
          </p>
        </div>
        <Button onClick={onAdd} variant="outline" className="h-11 cursor-pointer gap-2">
          <Plus className="size-4" />
          Agregar link
        </Button>
      </motion.div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={links.map((l) => l.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
}
