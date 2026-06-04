"use client";

import {
  User,
  Type,
  RectangleHorizontal,
  ImageIcon,
  Sparkles,
  GitBranch,
  ChevronRight,
} from "lucide-react";

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ITEMS: MenuItem[] = [
  {
    id: "profile",
    icon: <User className="size-5" />,
    title: "Perfil",
    description: "Layout, imagen y título",
  },
  {
    id: "text",
    icon: <Type className="size-5" />,
    title: "Texto",
    description: "Fuente y colores de texto",
  },
  {
    id: "buttons",
    icon: <RectangleHorizontal className="size-5" />,
    title: "Botones",
    description: "Estilo, sombra, esquinas",
  },
  {
    id: "wallpaper",
    icon: <ImageIcon className="size-5" />,
    title: "Fondo",
    description: "Fondo del perfil",
  },
  {
    id: "repos",
    icon: <GitBranch className="size-5" />,
    title: "Repos de GitHub",
    description: "Repositorios destacados",
  },
  {
    id: "stickers",
    icon: <Sparkles className="size-5" />,
    title: "Stickers",
    description: "Decora el canvas",
  },
];

interface CustomizeMenuProps {
  onSelect: (section: string) => void;
}

export function CustomizeMenu({ onSelect }: CustomizeMenuProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 shrink-0">
        <p className="text-sm font-semibold text-foreground">
          Personaliza tu perfil
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Edita el estilo y los stickers
        </p>
      </div>

      <div className="scroll-thin flex-1 space-y-1 overflow-y-auto pr-1">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all duration-150 hover:border-border/50 hover:bg-muted/30"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">
                {item.title}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {item.description}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
