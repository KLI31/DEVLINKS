# PLAN — ProfileCard con react-bits en la página de perfil público

> Objetivo: implementar el componente `ProfileCard` de react-bits (variante TS + Tailwind)
> en la página `app/u/[slug]/page.tsx` para mostrar el perfil público de un usuario.

---

## Contexto

La página `/u/[slug]` ya existe pero solo muestra el slug como placeholder.  
El backend ya expone `GET /users/:username/public` → `PublicProfile`.  
El API client `userApi.getPublicProfile(slug)` ya está conectado.

La variante elegida es **`ProfileCard-TS-TW`** (TypeScript + Tailwind CSS v4):  
card animada con efecto glare 3D en hover — encaja con la estética "developer-first" del proyecto.

---

## Paso 1 — Instalar el componente desde react-bits

```bash
npx shadcn@latest add @react-bits/ProfileCard-TS-TW
```

Esto genera el archivo fuente en `components/ui/ProfileCard.tsx`.  
Verificar que el componente quedó en esa ruta antes de continuar.

---

## Paso 2 — Crear el wrapper `PublicProfileCard` + flip card

Crear `components/profile/PublicProfileCard.tsx` (client component).  
Este componente toma el `PublicProfile`, maneja el estado de flip y alimenta al `ProfileCard` de react-bits.

```
components/
└── profile/
    ├── PublicProfileCard.tsx   ← wrapper principal con estado de flip (nuevo)
    ├── ProfileCardBack.tsx     ← cara trasera con info de prueba (nuevo)
    └── ProfileLinkItem.tsx     ← ítem de link individual (nuevo)
```

### Props del wrapper

```ts
interface PublicProfileCardProps {
  profile: PublicProfile; // del tipo en types/index.ts
}
```

### Qué mapear al ProfileCard de react-bits

| Campo ProfileCard (react-bits) | Campo PublicProfile (DevLinks)         |
| ------------------------------ | -------------------------------------- |
| `avatarUrl`                    | `profile.avatarUrl`                    |
| `name`                         | `profile.displayName`                  |
| `title` / `handle`             | `@${profile.username}` + `profile.bio` |
| `contact info / location`      | `profile.location`                     |
| accent / glare color           | `profile.accentColor`                  |

> El componente react-bits acepta children para contenido extra — usar ese slot
> para la lista de links y el badge de GitHub si `githubUsername` está presente.

---

## Paso 2b — Animación flip (cara delantera ↔ trasera)

### Mecanismo

El flip se dispara al hacer **clic en el card** (no en hover, para no colisionar con el efecto glare 3D de react-bits).

Estructura HTML/CSS del flip:

```
<div style="perspective: 1200px">               ← contenedor de perspectiva
  <motion.div                                   ← wrapper que rota
    style={{ transformStyle: "preserve-3d" }}
    animate={{ rotateY: isFlipped ? 180 : 0 }}
  >
    <div style={{ backfaceVisibility: "hidden" }}>   ← CARA DELANTERA
      <ProfileCard .../>
    </div>
    <div style={{                                     ← CARA TRASERA
      backfaceVisibility: "hidden",
      transform: "rotateY(180deg)",
    }}>
      <ProfileCardBack .../>
    </div>
  </motion.div>
</div>
```

### Configuración de la animación (motion)

```ts
transition={{
  type: "spring",
  stiffness: 55,
  damping: 12,
  mass: 0.9,
}}
```

Efecto: flip con un leve rebote al final — se siente físico, no robótico.  
Para `prefers-reduced-motion`: sustituir por `{ duration: 0 }` sin spring.

### Botón de flip

Un botón flotante en la esquina inferior derecha del card con un ícono `RotateCw` de lucide-react.  
No depende de clic en todo el card (evita conflictos con links y el glare effect).

```tsx
<button
  onClick={() => setIsFlipped(v => !v)}
  aria-label={isFlipped ? "Ver perfil" : "Ver más info"}
  className="absolute bottom-3 right-3 z-10 rounded-full p-2 ..."
>
  <RotateCw className="size-4" />
</button>
```

El botón rota 180° junto con la card (efecto visual de sincronía).

---

## Paso 2c — Cara trasera: `ProfileCardBack`

Crear `components/profile/ProfileCardBack.tsx`.  
Por ahora muestra **información de prueba** con estética "developer terminal".

### Diseño de la cara trasera

```
┌─────────────────────────────────┐
│  > dev_info.json          [■■□] │  ← header estilo terminal
├─────────────────────────────────┤
│                                 │
│  ● repos        42              │
│  ● commits      1.2k            │
│  ● followers    380             │
│  ● siguiendo    91              │
│                                 │
│  top langs:                     │
│  ▓▓▓▓▓▓░░  TypeScript  68%     │
│  ▓▓░░░░░░  Rust        22%     │
│  ░░░░░░░░  Go          10%     │
│                                 │
│  ─────────────────────────────  │
│  "GitHub stats coming soon"     │
│                    [próximamente]│
└─────────────────────────────────┘
```

### Props

```ts
interface ProfileCardBackProps {
  accentColor: string;
  githubUsername: string | null;
}
```

### Detalles visuales

- Fondo: `bg-[#0d1117]` (color GitHub dark) con borde `border border-white/10`
- Header: `bg-[#161b22]` con dots decorativos (rojo / amarillo / verde estilo macOS)
- Texto: `font-mono text-sm`
- Stats en verde phosphor: `text-[#39d353]` (color de la heatmap de GitHub)
- Barras de lenguajes: divs con `accentColor` y opacidad
- Badge "próximamente": `text-xs border rounded px-1.5` con `accentColor`
- Todas las cifras son hardcoded / mock por ahora — se reemplazarán con `GithubStats` en fase post-MVP

---

## Paso 3 — Crear `ProfileLinkItem`

Crear `components/profile/ProfileLinkItem.tsx` (client component).  
Renderiza un link individual con:

- Ícono (de `profile.links[n].icon`) usando `lucide-react`
- Título
- Hover con `accentColor` del perfil
- `target="_blank" rel="noopener noreferrer"`
- Tap target mínimo 44px (WCAG AA)
- Fire-and-forget click tracking (POST `/links/:id/click` sin await)

```ts
interface ProfileLinkItemProps {
  link: PublicProfile["links"][number];
  accentColor: string;
}
```

---

## Paso 4 — Actualizar `app/u/[slug]/page.tsx`

Reemplazar el placeholder con la implementación real:

```
1. await params para obtener slug
2. try/catch → userApi.getPublicProfile(slug)
3. Si profile === null → notFound() de next/navigation
4. Renderizar <PublicProfileCard profile={profile} />
```

### Metadata dinámica

Agregar `generateMetadata` en el mismo archivo:

```ts
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const profile = await userApi.getPublicProfile(slug).catch(() => null);
  return {
    title: profile?.displayName ?? slug,
    description: profile?.bio ?? `Perfil de ${slug} en DevLinks`,
    openGraph: {
      images: profile?.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}
```

---

## Paso 5 — Layout de la página

La página debe quedar centrada, con fondo que respete el `bgType`/`bgColor` del perfil:

```
<main style={{ background: resolvedBg }}>        ← fondo del usuario
  <PublicProfileCard profile={profile} />         ← card central
</main>
```

Para `bgType`:
- `"solid"` → `backgroundColor: profile.bgColor`
- `"default"` → usar variables CSS del tema (`var(--background)`)

No implementar tipos de fondo adicionales aún (fuera del MVP).

---

## Paso 6 — Manejar estado vacío / errores

| Caso                              | Comportamiento                      |
| --------------------------------- | ----------------------------------- |
| Perfil no encontrado (404)        | `notFound()` → `app/not-found.tsx`  |
| Avatar `null`                     | Mostrar iniciales con `accentColor` |
| Bio `null`                        | No renderizar el campo              |
| Location `null`                   | No renderizar el campo              |
| Lista de links vacía              | Mostrar mensaje "Sin links aún"     |
| `githubUsername` null             | No mostrar badge de GitHub          |

---

## Archivos que se crean o modifican

| Archivo                                    | Acción                             |
| ------------------------------------------ | ---------------------------------- |
| `components/ui/ProfileCard.tsx`            | Creado por shadcn CLI (react-bits) |
| `components/profile/PublicProfileCard.tsx` | Nuevo — wrapper con flip state     |
| `components/profile/ProfileCardBack.tsx`   | Nuevo — cara trasera (mock data)   |
| `components/profile/ProfileLinkItem.tsx`   | Nuevo                              |
| `app/u/[slug]/page.tsx`                    | Modificado                         |

---

## Dependencias

No se agregan dependencias nuevas. El proyecto ya tiene:
- `motion` (animaciones)
- `lucide-react` (íconos de links)
- `next-themes` (tema)
- `@react-bits` en el registry de shadcn

---

## Reglas de diseño a respetar

- Fuente: `font-mono` (JetBrains Mono) en todo el card
- Dark mode por defecto — no añadir lógica de light mode
- Sin gradientes saturados ni glassmorphism exagerado
- `prefers-reduced-motion`: el efecto 3D/glare del ProfileCard debe desactivarse
- Mensajes de UI en español, código en inglés
- No implementar GitHub stats aquí — son post-MVP en la página pública

---

## Orden de implementación sugerido

1. `npx shadcn@latest add @react-bits/ProfileCard-TS-TW`
2. Revisar el código generado en `components/ui/ProfileCard.tsx`
3. Crear `ProfileLinkItem.tsx`
4. Crear `ProfileCardBack.tsx` con mock data (terminal style)
5. Crear `PublicProfileCard.tsx` con el flip wrapper + estado `isFlipped`
6. Actualizar `app/u/[slug]/page.tsx` con `generateMetadata` + render real
7. Probar en `/u/<tu-username>` con el dev server:
   - Verificar glare effect en la cara delantera
   - Verificar flip spring al hacer clic en el botón `RotateCw`
   - Verificar que la cara trasera se ve correctamente
8. Verificar en móvil (tap targets, layout)
9. Verificar con `prefers-reduced-motion` activado en el SO

---

## Notas de implementación para el flip

- El `perspective` en el contenedor externo **debe ser inline style**, no clase Tailwind — Tailwind no tiene perspective dinámico en v4.
- Ambas caras deben tener el **mismo tamaño** (width/height iguales) para que el flip no genere saltos de layout. Usar `min-h-[520px]` o similar.
- El `overflow: hidden` en el card de react-bits puede cortar el efecto 3D — si pasa, quitar el overflow del wrapper externo y manejarlo en cada cara por separado.
- En iOS Safari, `backface-visibility` requiere el prefijo `-webkit-backface-visibility: hidden` — agregarlo como inline style si hay problemas.
