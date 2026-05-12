# Links.md — Página de gestión de links del dashboard

> Plan completo para `app/(dashboard)/dashboard/links/page.tsx`:
> CRUD de links, drag-and-drop, selector de iconos y animaciones con motion.

---

## Hallazgos del análisis

### Lo que ya existe en el proyecto actual

| Recurso                              | Estado         | Nota                                                              |
| ------------------------------------ | -------------- | ----------------------------------------------------------------- |
| `lib/api/links.api.ts`               | ✅ Listo       | `getAll`, `create`, `update`, `remove`, `reorder`, `toggle`       |
| `lib/validations/link.schema.ts`     | ✅ Listo       | Zod schema para el form (título, url, icono)                      |
| `types/index.ts` → `LinkItem`        | ✅ Listo       | Tipo completo con `id, title, url, icon, displayOrder, isActive`  |
| `lib/animations.ts`                  | ✅ Listo       | `tooltipAnimation` y helpers de motion reutilizables              |
| `lib/icons.ts`                       | ⚠️ Incompleto  | Solo 8 iconos; necesita expandirse a ~44 plataformas              |
| `store/auth-store.ts`                | ✅ Listo       | Zustand store de auth (necesitamos `user.username`)               |
| `store/links-store.ts`               | ❌ No existe   | Hay que crearlo (copiado del proyecto deprecated y adaptado)      |
| `app/(dashboard)/dashboard/links/`   | ❌ No existe   | La página está en el Sidebar pero sin implementar                 |
| `components/links/`                  | ❌ No existe   | Ningún componente de gestión de links en el proyecto actual       |

### Referencia del proyecto deprecated

El deprecated tenía toda la implementación completa:
- `icon-picker.tsx` — 44 plataformas vía SimpleIcons CDN + Iconify overrides
- `link-card.tsx` — Card sortable con dnd-kit
- `link-list.tsx` — DnD context + reorder optimista
- `link-modal.tsx` — Formulario con react-hook-form + zod
- `links-client.tsx` — Orquestador client con Zustand
- `links-preview.tsx` — Preview en tiempo real con temas

Todo esto debe **portarse y actualizarse** al nuevo proyecto: estilos dark-first, `font-mono`, animaciones motion más ricas.

---

## Layout de la página

```
┌─────────────────────────────────┬─────────────────────────────┐
│  PANEL IZQUIERDO (flex-1)       │  PANEL DERECHO (w-80)       │
│                                 │  oculto en < lg             │
│  ┌─ header ─────────────────┐   │  ┌─ preview ─────────────┐  │
│  │ Enlaces · 3/20    [+ Add]│   │  │  Vista previa         │  │
│  └──────────────────────────┘   │  │  (perfil público)     │  │
│                                 │  │                       │  │
│  ┌─ hint bar ───────────────┐   │  │  avatar + nombre      │  │
│  │ ⣿ Arrastra para ordenar  │   │  │                       │  │
│  └──────────────────────────┘   │  │  [link 1]             │  │
│                                 │  │  [link 2]             │  │
│  ┌─ link list ──────────────┐   │  │  ...                  │  │
│  │ [≡] [ico] título  url  ● │   │  └───────────────────────┘  │
│  │      [edit] [del]        │   │                             │
│  │ ...                      │   │                             │
│  └──────────────────────────┘   │                             │
└─────────────────────────────────┴─────────────────────────────┘
```

---

## Estructura de archivos a crear

```
store/
└── links-store.ts                     ← Zustand store (NUEVO)

lib/
└── icons.ts                           ← Expandir: de 8 a 44 iconos (MODIFICAR)

app/(dashboard)/dashboard/links/
└── page.tsx                           ← Server Component + Suspense (NUEVO)

components/links/
├── LinksClient.tsx                    ← Orquestador client principal (NUEVO)
├── LinkCard.tsx                       ← Tarjeta sortable con dnd-kit (NUEVO)
├── LinkList.tsx                       ← DnD context + lista animada (NUEVO)
├── LinkFormSheet.tsx                  ← Sheet lateral con form (NUEVO)
├── IconPicker.tsx                     ← Grid de 44 iconos buscable (NUEVO)
└── LinksPreview.tsx                   ← Preview en tiempo real (NUEVO)
```

---

## Parte 1 — Zustand store `store/links-store.ts`

```ts
interface LinksStore {
  links: LinkItem[];
  setLinks: (links: LinkItem[]) => void;
  addLink: (link: LinkItem) => void;
  updateLink: (link: LinkItem) => void;
  removeLink: (id: string) => void;
}
```

Crear con `create<LinksStore>()(...)` de Zustand.  
Sin persistencia — los datos vienen del servidor al montar la página.

---

## Parte 2 — Expandir `lib/icons.ts`

### Agregar la lista completa de plataformas

Agregar la constante `PLATFORM_ICONS` con 44 entradas (portar del deprecated):

```ts
export const PLATFORM_ICONS = [
  { slug: "github",        label: "GitHub" },
  { slug: "youtube",       label: "YouTube" },
  { slug: "instagram",     label: "Instagram" },
  { slug: "x",             label: "X / Twitter" },
  { slug: "linkedin",      label: "LinkedIn" },      // ← Iconify override
  { slug: "tiktok",        label: "TikTok" },
  { slug: "twitch",        label: "Twitch" },
  { slug: "discord",       label: "Discord" },
  { slug: "spotify",       label: "Spotify" },
  { slug: "facebook",      label: "Facebook" },
  { slug: "reddit",        label: "Reddit" },
  { slug: "medium",        label: "Medium" },
  { slug: "devdotto",      label: "Dev.to" },
  { slug: "hashnode",      label: "Hashnode" },
  { slug: "dribbble",      label: "Dribbble" },
  { slug: "figma",         label: "Figma" },
  { slug: "notion",        label: "Notion" },
  { slug: "codepen",       label: "CodePen" },
  { slug: "stackoverflow", label: "Stack Overflow" },
  { slug: "npm",           label: "npm" },
  { slug: "vercel",        label: "Vercel" },
  { slug: "netlify",       label: "Netlify" },
  { slug: "gitlab",        label: "GitLab" },
  { slug: "docker",        label: "Docker" },
  { slug: "telegram",      label: "Telegram" },
  { slug: "whatsapp",      label: "WhatsApp" },
  { slug: "bluesky",       label: "Bluesky" },
  { slug: "patreon",       label: "Patreon" },
  { slug: "kofi",          label: "Ko-fi" },
  { slug: "buymeacoffee",  label: "Buy Me a Coffee" },
  { slug: "gumroad",       label: "Gumroad" },
  { slug: "producthunt",   label: "Product Hunt" },
  { slug: "behance",       label: "Behance" },
  { slug: "substack",      label: "Substack" },
  { slug: "threads",       label: "Threads" },
  { slug: "mastodon",      label: "Mastodon" },
  { slug: "bitbucket",     label: "Bitbucket" },
  { slug: "snapchat",      label: "Snapchat" },
  { slug: "pinterest",     label: "Pinterest" },
  { slug: "soundcloud",    label: "SoundCloud" },
  { slug: "bandcamp",      label: "Bandcamp" },
  { slug: "etsy",          label: "Etsy" },
  { slug: "paypal",        label: "PayPal" },
  { slug: "applemusic",    label: "Apple Music" },
] as const;

export type IconSlug = (typeof PLATFORM_ICONS)[number]["slug"];
```

### Agregar `iconUrl` con soporte Iconify

```ts
const ICONIFY_OVERRIDES: Record<string, string> = {
  linkedin: "mdi:linkedin",
};

export function iconUrl(slug: string, color?: string): string {
  const hex = color?.replace(/^#/, "");
  const iconify = ICONIFY_OVERRIDES[slug];
  if (iconify) {
    return hex
      ? `https://api.iconify.design/${iconify}.svg?color=%23${hex}`
      : `https://api.iconify.design/${iconify}.svg`;
  }
  return hex
    ? `https://cdn.simpleicons.org/${slug}/${hex}`
    : `https://cdn.simpleicons.org/${slug}`;
}
```

El `iconMap` y `getSocialIconUrl` actuales se mantienen sin cambios (son usados en la página pública).

---

## Parte 3 — Página `app/(dashboard)/dashboard/links/page.tsx`

Server Component con `Suspense`. Hace el fetch inicial de los links del usuario.

```ts
import { Suspense } from "react";
import { linksApi } from "@/lib/api";
import { LinksClient } from "@/components/links/LinksClient";
import { LinksSkeleton } from "@/components/links/LinksSkeleton";  // ver más abajo

export default function DashboardLinksPage() {
  return (
    <Suspense fallback={<LinksSkeleton />}>
      <LinksPageContent />
    </Suspense>
  );
}

async function LinksPageContent() {
  const links = await linksApi.getAll();
  return <LinksClient initialLinks={links} />;
}
```

---

## Parte 4 — Componentes

### 4.1 `LinksClient.tsx` — orquestador principal

**`"use client"`** — inicializa el store, controla el Sheet de edición/creación.

```ts
interface LinksClientProps {
  initialLinks: LinkItem[];
}
```

Responsabilidades:
- `useEffect` para inicializar `links-store` con `initialLinks`
- Estado `sheetOpen: boolean` y `editingLink: LinkItem | null`
- Funciones `handleAdd()` y `handleEdit(link)` que abren el `LinkFormSheet`
- Contador `links.length / 20` en el header
- Renderiza el layout two-panel

### 4.2 `LinkList.tsx` — lista con dnd-kit

**`"use client"`**

Monta el `DndContext` con:
- `PointerSensor` con `activationConstraint: { distance: 5 }`
- `KeyboardSensor` para accesibilidad (con `sortableKeyboardCoordinates`)
- Modifiers: `restrictToVerticalAxis + restrictToParentElement`
- `onDragEnd`: aplica `arrayMove`, actualiza optimistamente el store y llama `linksApi.reorder()`; en error hace rollback + toast

```tsx
<DndContext ...>
  <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
    <AnimatePresence initial={false}>
      {links.map(link => (
        <LinkCard key={link.id} link={link} onEdit={onEdit} />
      ))}
    </AnimatePresence>
  </SortableContext>
</DndContext>
```

Estado vacío animado:
```tsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center"
>
  <Link2 className="size-10 text-muted-foreground/40" />
  <p className="text-sm text-muted-foreground">Aún no tienes ningún link.</p>
</motion.div>
```

### 4.3 `LinkCard.tsx` — tarjeta sortable

**`"use client"`**

Usa `useSortable` de `@dnd-kit/sortable`.

#### Animaciones con motion

```tsx
<motion.div
  ref={setNodeRef}
  style={{ transform: CSS.Transform.toString(transform), transition }}
  layout                          // ← reordena suavemente con layout animation
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}  // ← exit al eliminar
  transition={{ duration: 0.2, ease: "easeOut" }}
  whileHover={isDragging ? undefined : { x: 3, scale: 1.005 }}
  className={cn(
    "group flex items-center gap-3 rounded-xl border border-border/70",
    "bg-card px-4 py-3 shadow-[var(--shadow-card)]",
    isDragging && "z-50 scale-[1.02] border-primary/40 shadow-[var(--shadow-hover)]",
    !link.isActive && "opacity-55",
  )}
>
```

#### Contenido de la card

```
[≡ grip] [icono 36px] [título + url truncada]  ···  [toggle] [edit] [delete]
```

- **Grip**: `GripVertical` de lucide, `cursor-grab`, accesible con `aria-label="Arrastrar para reordenar"`
- **Ícono**: `next/image` + `iconUrl(link.icon)`, fallback `Link2` de lucide
- **Toggle**: switch custom CSS (idéntico al deprecated) con estado optimista; icono `Loader2` mientras carga
- **Edit**: botón `Pencil` → llama `onEdit(link)`
- **Delete**: botón `Trash2` → confirma, llama `linksApi.remove()`, `removeLink()` del store, toast success. Mientras borra muestra `Loader2`

#### Animación del ícono en hover

```tsx
<motion.div
  variants={{
    hovered: { rotate: [0, -8, 6, 0], scale: 1.1 },
  }}
  transition={{ duration: 0.35 }}
  className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/50"
>
```

### 4.4 `LinkFormSheet.tsx` — formulario lateral

Usar **`Sheet`** de shadcn (lado derecho) en lugar de Dialog central — más cómodo en desktop para ver la lista mientras se edita.

```tsx
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="right" className="w-full max-w-sm">
    <SheetHeader>
      <SheetTitle className="font-mono">
        {isEdit ? "Editar link" : "Nuevo link"}
      </SheetTitle>
    </SheetHeader>
    {/* form aquí */}
  </SheetContent>
</Sheet>
```

**Form con react-hook-form + zod** usando el `link.schema.ts` ya existente:

```
[label] Título *
[Input] placeholder="Mi GitHub"

[label] URL *
[Input] placeholder="https://github.com/usuario"

[label] Ícono (opcional)
[botón toggle acordeón]
  └─ <IconPicker value={...} onChange={...} />

[Cancelar]  [Crear link / Guardar cambios]
```

- `disabled` en submit mientras `isSubmitting`
- `Loader2` en el botón de submit
- Toast `sonner` en éxito y en error
- Al crear/editar → `linksApi.create()` o `linksApi.update()` → actualiza el store optimistamente

### 4.5 `IconPicker.tsx` — selector de iconos

**`"use client"`**

Grid de 5 columnas (sm: 7 columnas) con todos los `PLATFORM_ICONS` de `lib/icons.ts`.

```tsx
interface IconPickerProps {
  value: string | undefined;
  onChange: (slug: string | undefined) => void;
}
```

Estructura:
```
[🔍 Buscar plataforma...]  [Quitar ×]

[gh] [yt] [ig] [x]  [li] [tt] [tw]
[dc] [sp] [fb] [rd] [md] [dt] [hn]
...  (scroll interno max-h-52)
```

- Cada botón: `next/image` del CDN + label de 9px debajo
- Seleccionado: `border-primary bg-primary/10` + badge check `✓` en esquina
- Input de búsqueda filtra por `label` (case-insensitive)
- Botón "Quitar" solo visible cuando hay valor seleccionado
- Animación de entrada al abrir el acordeón: `max-h` transition (CSS) o `motion.div` con `AnimatePresence`

### 4.6 `LinksPreview.tsx` — vista previa en tiempo real

**`"use client"`**

Lee el store de links (`useLinksStore`) y el usuario (`useAuthStore`) para renderizar un mockup del perfil público dentro del panel derecho.

Simula el layout del perfil:
- Avatar (con iniciales como fallback)
- Nombre + bio
- Cada link activo como botón (estilo según `buttonStyle` del usuario)
- Footer "devlinks.dev"

> Se pueden portar directamente las funciones de apariencia del deprecated
> (`THEMES`, `BUTTON_STYLES`, `FONTS`, `configFromUser`, `isLight`) a `lib/appearance.ts`.

---

## Parte 5 — Animaciones de página (motion)

### 5.1 Entrada de la página

```tsx
// En LinksClient, wrappear el contenido principal:
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

### 5.2 Contador de links en el header

```tsx
// Número que hace spring cuando cambia:
<motion.span
  key={links.length}   // re-monta en cada cambio → dispara animate
  initial={{ scale: 1.3, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  className="font-mono text-sm text-muted-foreground"
>
  {links.length} / 20
</motion.span>
```

### 5.3 Hint bar de drag (aparece cuando hay más de 1 link)

```tsx
<AnimatePresence>
  {links.length > 1 && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-1.5 border-b border-border/50 px-6 py-2.5"
    >
      <GripVertical className="size-3.5 text-muted-foreground/50" />
      <p className="text-xs text-muted-foreground">
        Arrastra los links para reordenarlos. Los cambios se guardan automáticamente.
      </p>
    </motion.div>
  )}
</AnimatePresence>
```

### 5.4 Item drag activo

Cuando `isDragging === true` en `LinkCard`:
- `scale: 1.02`, `boxShadow` elevado, `border-primary/40`
- El overlay de dnd-kit maneja la posición

### 5.5 Skeleton (`LinksSkeleton`)

```tsx
// Dentro de components/links/LinksSkeleton.tsx
// (o como función interna de la página)
// Imita el layout two-panel con divs animados pulse
```

### 5.6 `prefers-reduced-motion`

En `LinksClient` y `LinkCard`:

```tsx
const prefersReducedMotion = useReducedMotion();

// En LinkCard:
whileHover={prefersReducedMotion ? undefined : { x: 3, scale: 1.005 }}
initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
```

---

## Parte 6 — Estados de la UI

| Estado                  | Comportamiento                                           |
| ----------------------- | -------------------------------------------------------- |
| Lista vacía             | Empty state animado con `Link2` icon + CTA              |
| 20/20 links             | Botón "+ Agregar link" disabled + tooltip "Límite alcanzado" |
| Link inactivo           | Card con `opacity-55`                                    |
| Dragging                | Card elevada, sombra, border accent                      |
| Reorder pending         | Nada visual (optimista) — rollback silencioso en error   |
| Toggle loading          | Spinner en el toggle, botón deshabilitado               |
| Delete loading          | Spinner en el botón trash, botón deshabilitado          |
| Form submitting         | Spinner en el botón submit, inputs deshabilitados        |
| Error API               | `toast.error(resolveErrorMessage(err))`                 |

---

## Orden de implementación sugerido

1. **Crear `store/links-store.ts`** con Zustand
2. **Expandir `lib/icons.ts`** con `PLATFORM_ICONS`, `iconUrl`, `ICONIFY_OVERRIDES`
3. **Crear `components/links/IconPicker.tsx`** (independiente, testeable en aislamiento)
4. **Crear `components/links/LinkFormSheet.tsx`** con el form y el IconPicker integrado
5. **Crear `components/links/LinkCard.tsx`** con dnd-kit + motion
6. **Crear `components/links/LinkList.tsx`** con DnD context + AnimatePresence
7. **Crear `components/links/LinksPreview.tsx`** (portar `lib/appearance.ts` del deprecated primero)
8. **Crear `components/links/LinksClient.tsx`** ensamblando todo
9. **Crear `app/(dashboard)/dashboard/links/page.tsx`** con Suspense + fetch
10. Probar en dev:
    - Crear link con icono → aparece animado en la lista + en el preview
    - Editar → Sheet se abre con datos pre-llenados
    - Toggle → cambia estado + preview se actualiza
    - Eliminar → card sale con exit animation
    - Drag & drop → reordenado optimista + preview refleja el nuevo orden
    - `prefers-reduced-motion` activado → sin animaciones

---

## Dependencias

Todas ya están instaladas:

| Paquete            | Uso                                     |
| ------------------ | --------------------------------------- |
| `motion/react`     | Animaciones (ya usado en el Sidebar)    |
| `@dnd-kit/core`    | Drag and drop                           |
| `@dnd-kit/sortable`| Sortable list                           |
| `@dnd-kit/modifiers`| Restricciones de drag                 |
| `react-hook-form`  | Formulario                              |
| `@hookform/resolvers`| Integración con zod                  |
| `zod`              | Validación (link.schema.ts ya existe)   |
| `sonner`           | Toasts                                  |
| `zustand`          | Store de links                          |
| `next/image`       | Iconos desde CDN                        |

No se agrega ninguna dependencia nueva.

---

## Notas de implementación

- **`next/image` + SimpleIcons CDN**: agregar `cdn.simpleicons.org` y `api.iconify.design` a la lista de dominios permitidos en `next.config.js` bajo `images.domains` (o `remotePatterns`).
- **Sheet vs Dialog**: el `Sheet` de shadcn ya está en el proyecto (`components/ui/`). Si no existe, instalarlo con `npx shadcn@latest add sheet`.
- **`layout` prop de motion**: usar `layout` en `LinkCard` para que las reordenaciones sean suaves con layout animations de Framer. Agregar `layoutId` si se necesita shared layout entre la lista y el preview.
- **Rollback en reorder**: guardar una copia del array antes del `setLinks(reordered)` para restaurarla en el catch.
- **Fire-and-forget en click tracking**: el `ProfileLinkItem` (perfil público) ya hace fire-and-forget; en la página de gestión no hay tracking, solo en el perfil público.
