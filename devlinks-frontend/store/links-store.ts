import { create } from "zustand";
import type { LinkItem } from "@/types";

export interface LinksStore {
  links: LinkItem[];
  setLinks: (links: LinkItem[]) => void;
  addLink: (link: LinkItem) => void;
  updateLink: (link: LinkItem) => void;
  removeLink: (id: string) => void;
}

export const useLinksStore = create<LinksStore>()((set) => ({
  links: [],
  setLinks: (links) => set({ links }),
  addLink: (link) =>
    set((state) => ({
      links: [...state.links, link].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    })),
  updateLink: (link) =>
    set((state) => ({
      links: state.links.map((l) => (l.id === link.id ? link : l)),
    })),
  removeLink: (id) =>
    set((state) => ({
      links: state.links.filter((l) => l.id !== id),
    })),
}));
