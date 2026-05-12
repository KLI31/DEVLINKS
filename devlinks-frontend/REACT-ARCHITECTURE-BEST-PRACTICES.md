# REACT-ARCHITECTURE-BEST-PRACTICES.md — DevLinks Frontend

> Guía de buenas prácticas de **React 19** y **arquitectura frontend** para agentes de IA que trabajen en este repo.
> Si una práctica aquí descrita no te resulta familiar, **NO improvises**: investiga primero (docs oficiales, RFCs, source) y confirma antes de codear.

---

## 0. Regla cero — Investiga antes de inventar

Si dudas, **detente y consulta** antes de generar código:

- No conoces la API exacta de React 19 (`use`, `useActionState`, `useOptimistic`, `useFormStatus`, `useTransition` con async, ref como prop, etc.).
- No estás seguro de si un patrón es idiomático o si existe una primitiva que ya lo resuelve.
- No sabes cómo modelar el estado (servidor vs URL vs cliente vs form).
- Estás a punto de añadir una librería que duplique algo que React, Next.js o shadcn ya ofrecen.

**Fuentes oficiales obligatorias** (en este orden):

1. https://react.dev — documentación canónica.
2. https://react.dev/blog — releases y RFCs estabilizados.
3. https://github.com/reactjs/rfcs — propuestas y discusiones.
4. https://nextjs.org/docs — interacción con App Router (Server Components, Actions).
5. Repos oficiales de las libs que uses (`react-hook-form`, `zod`, `@dnd-kit`, `sonner`, `zustand`, `tanstack/query`).

Si tras consultar sigue habiendo ambigüedad, **pregunta al usuario**. No adivines APIs ni firmas.

---

## 1. Modelo mental: dónde vive cada estado

Antes de elegir herramienta, clasifica el estado:

| Tipo                | Vive en                                     | Herramienta                                         |
| ------------------- | ------------------------------------------- | --------------------------------------------------- |
| **Servidor**        | Base de datos, API                          | Server Components + `fetch` con cache; Server Actions |
| **URL**             | `searchParams`, `params`, hash              | App Router params, `useSearchParams`                 |
| **Form**            | Inputs en pantalla                          | `react-hook-form` + `zod` (o `useActionState`)       |
| **UI local**        | Modal abierto, tab activo, hover            | `useState` en el componente                          |
| **UI compartida**   | Sidebar colapsado, tema, toasts             | Context o `zustand` (un store pequeño y plano)       |
| **Derivado**        | Algo computable de los otros                | Cálculo en render; `useMemo` solo si mides costo    |

**Reglas:**

- **No metas estado de servidor en `useState`.** Ese trabajo es del Server Component o de TanStack Query.
- **No dupliques estado.** Si puedes derivar, deriva.
- **Eleva el estado lo mínimo necesario**, no más arriba "por si acaso".
- **URL como estado** para filtros, paginación, tabs persistentes — es shareable y sobrevive al refresh.

---

## 2. Componentes: tamaño y responsabilidad

- Un componente hace **una cosa**. Si su nombre necesita "And" o "With" probablemente son dos.
- **Límite blando: ~150 líneas** por archivo de componente. Si lo superas, divide.
- **Props ≤ 7**. Más allá de eso suele indicar que el componente hace demasiado o necesita composición (`children`, slots).
- **Composición > configuración**. Prefiere `<Card><Card.Header/></Card>` o `children` antes que 15 props booleanas.
- **Evita `forwardRef` manual**: en React 19 `ref` es una prop normal. No envuelvas en `forwardRef` salvo compatibilidad con libs viejas.

### Tipos de componentes en este repo

```
components/
├── ui/              shadcn primitives — NO los modifiques sin razón
├── <feature>/       componentes específicos de un dominio (links, profile, auth)
└── shared/          componentes transversales (Header, Footer, etc.)
```

Convenciones (de `CLAUDE.md`):
- Archivos `PascalCase.tsx` para componentes.
- Hooks `useCamelCase.ts`.
- Un componente por archivo (excepto subcomponentes privados muy ligados).

---

## 3. Hooks

- **Reglas de hooks no son negociables**: top-level, mismo orden, solo en componentes o hooks.
- **Custom hooks** cuando hay lógica con estado/efectos reutilizable. Si solo encapsulan funciones puras, son utilidades, no hooks.
- **`useEffect` es código de escape**. Antes de escribirlo, pregúntate:
  - ¿Puedo derivarlo en render? → no necesitas efecto.
  - ¿Es respuesta a un evento? → ponlo en el handler.
  - ¿Es sincronización con un sistema externo (DOM, suscripción, timer)? → entonces sí, efecto.
- **Cleanup siempre** que el efecto registre algo (listener, timer, suscripción, fetch abortable).
- **Dependencias completas y honestas**. No silencies el lint con `// eslint-disable`. Si la lista crece, repensá el componente.
- **`useMemo` / `useCallback` solo cuando hay un coste medido o son requeridos por igualdad referencial** (deps de otro hook, `memo`). Por default no los uses.
- **`useTransition`** para updates no urgentes (filtros, navegaciones lentas). En React 19 acepta async functions.
- **`use(promise)`** dentro de Suspense para consumir promesas creadas en server.
- **`useOptimistic`** para UX optimista en mutaciones.
- **`useActionState`** para estado de formularios con Server Actions.

---

## 4. Renderizado y performance

Optimiza **solo cuando midas un problema**. Por defecto, React es lo bastante rápido.

- **Claves estables en listas**: nunca uses el índice del array si la lista puede reordenarse, filtrarse o paginarse.
- **`React.memo`** solo en componentes pesados que reciben las mismas props frecuentemente. Si las props cambian siempre, no sirve.
- **Lista virtualizada** (`@tanstack/react-virtual`) cuando renderices > ~200 items con altura variable.
- **Code splitting** con `next/dynamic` para componentes pesados que no son críticos para el primer paint (editor de imagen, modal complejo).
- **Imágenes** siempre con `next/image` (ver `NEXTJS-BEST-PRACTICES.md`).
- Mide con React DevTools Profiler antes de optimizar. Conjeturas no valen.

---

## 5. Forms

Stack en este repo: **`react-hook-form` + `zod`** (forms del cliente) o **`useActionState` + `zod`** (Server Actions).

- **Esquema Zod único** para validación cliente y servidor cuando sea posible. Comparte el tipo con `z.infer`.
- **Validación en `onBlur` o `onSubmit`** por defecto, no en `onChange` (ruido visual).
- **Mensajes de error en español** (convención del proyecto), accesibles via `aria-describedby` apuntando al error.
- **Estados**: `isSubmitting`, `isDirty`, `errors`. Deshabilita el submit mientras `isSubmitting`.
- **Optimistic UI** con `useOptimistic` cuando la red sea el cuello de botella (reordenar links, toggle activo).
- **No re-renderices el form completo** en cada keystroke: `react-hook-form` ya minimiza esto si usas `register` correctamente, no `watch` global.

---

## 6. Estado global del cliente

- **Primera opción: no lo necesitas.** Server Components + URL + form state cubren el 80%.
- **Segunda opción: Context** para cosas que cambian poco (tema, usuario actual, locale). Un Provider por concern, **no** un mega-Context.
- **Tercera opción: Zustand** cuando hay estado compartido que sí cambia (toasts queue, sidebar, draft del editor de perfil).
  - Un store por dominio, **no** un store gigante.
  - Selectores explícitos para minimizar re-renders.
  - Nada de lógica de servidor aquí.
- **TanStack Query** si aparece la necesidad de caché cliente sofisticado (no es el caso por defecto en App Router; reevalúa antes de meterlo).

---

## 7. Errores

- **Error Boundaries** (`error.tsx` en App Router, o `react-error-boundary` para boundaries más finos) en cada feature autosuficiente.
- **Errores tipados** en respuestas de Server Actions y API: `{ ok: true, data } | { ok: false, error: { code, message } }`. No lances strings.
- **Diferencia errores esperados de excepciones.** Validación fallida = estado de UI. DB caída = excepción que escala al boundary.
- **Toasts (`sonner`) en español** para feedback de mutaciones — éxito y error.
- **Nunca tragues errores en silencio.** Si decides ignorar uno, deja un comentario corto explicando por qué.

---

## 8. Accesibilidad (no opcional)

- **Semántica primero**: `<button>` para acciones, `<a>` para navegación. Nunca `<div onClick>`.
- **Foco visible** en todo elemento interactivo. No mates el outline sin reemplazarlo.
- **Tap targets ≥ 44px** (regla de DevLinks).
- **Roles ARIA** solo si la semántica nativa no alcanza. ARIA mal puesto es peor que nada.
- **Drag & drop** debe ser usable por teclado (`@dnd-kit/core` lo da, pero verifica).
- **`prefers-reduced-motion`** respetado en cualquier animación.
- **Contraste AA mínimo** (verifica con DevTools).

---

## 9. Estructura de archivos por feature

Preferimos **colocation por feature** sobre carpetas globales por tipo:

```
app/(dashboard)/dashboard/links/
├── page.tsx               server component, orquesta
├── _components/           privados de esta ruta (prefijo _ = no router)
│   ├── LinksList.tsx
│   ├── LinkRow.tsx
│   └── LinkFormDialog.tsx
├── _hooks/
│   └── useLinkReorder.ts
├── _lib/
│   ├── actions.ts         server actions
│   ├── schema.ts          zod schemas
│   └── fetch-links.ts
└── loading.tsx
```

Reglas:
- Carpetas con `_` no generan ruta (App Router).
- Componentes globales reutilizables suben a `components/`.
- Hooks globales suben a `hooks/`.
- **No subas algo a global hasta el segundo uso real.** Premature abstraction es peor que duplicar 20 líneas.

---

## 10. Capas y dependencias

```
app/         (rutas, layouts, pages, server actions)
  ↓ usa
components/  (UI: ui/ + feature-specific)
  ↓ usa
hooks/       (lógica reutilizable de cliente)
  ↓ usa
lib/         (utilidades puras: api client, formatters, zod schemas, constants)
  ↓ usa
types/       (tipos compartidos)
```

- **Las dependencias fluyen hacia abajo, nunca hacia arriba.** `lib/` no importa de `components/`.
- **Sin imports circulares.** Si los detectas, reorganiza.
- **Alias de import** (`@/components/...`) en todos lados — nunca rutas relativas largas (`../../../`).

---

## 11. API client y datos

- Un único cliente HTTP en `lib/api.ts` (fetch wrapper) que:
  - Inyecta el access token.
  - Maneja refresh transparente (401 → refresh → retry una vez).
  - Tipa la respuesta con generics.
  - Lanza errores estructurados (`ApiError` con `status`, `code`, `message`).
- **No metas `fetch` directo en componentes** salvo Server Components con `fetch` nativo de Next (cacheable). Para llamadas autenticadas al backend NestJS, usa el client.
- **Tipos de respuesta** derivados del backend (Zod schema compartido o tipos generados).

---

## 12. Testing (cuando llegue)

- **Vitest + React Testing Library** para unitarios y componentes.
- **Playwright** para e2e críticos (login, crear link, perfil público).
- Testea **comportamiento**, no implementación. `getByRole` antes que `getByTestId`.
- Mocks mínimos. Si tu test mockea 8 cosas, el componente está mal diseñado.

---

## 13. Lo que NO hacer

- ❌ `useEffect` para sincronizar dos `useState` que podrían ser uno derivado.
- ❌ `any` en TypeScript. Si no sabes el tipo, **investígalo**.
- ❌ Estado del servidor metido en Zustand/Context.
- ❌ Componentes de >300 líneas con 12 `useState`.
- ❌ Imports relativos largos (`../../../lib/...`).
- ❌ Lógica de negocio en componentes UI (`components/ui/*`).
- ❌ `dangerouslySetInnerHTML` sin sanitizar.
- ❌ Animaciones que ignoren `prefers-reduced-motion`.
- ❌ Comentarios en JSX que no aporten valor (regla de `CLAUDE.md`).
- ❌ Añadir librería UI que duplique shadcn.

---

## 14. Checklist antes de abrir PR

- [ ] ¿Cada `useState` y `useEffect` están justificados?
- [ ] ¿El estado vive en la capa correcta (server / URL / form / cliente)?
- [ ] ¿Las listas tienen `key` estable (no índice)?
- [ ] ¿El componente tiene una sola responsabilidad y < ~150 líneas?
- [ ] ¿Forms validan con Zod, mensajes en español, errores accesibles?
- [ ] ¿Hay error boundary en la feature?
- [ ] ¿Accesibilidad: roles correctos, foco visible, tap targets ≥ 44px, contraste AA?
- [ ] ¿Sin `any`, sin imports circulares, sin rutas relativas largas?
- [ ] ¿Si añadiste un hook custom, está testeado o al menos justificado?

---

## 15. Si algo de esta guía está desactualizado

React 19 introdujo cambios grandes (ref como prop, Actions, `use`, compiler opcional). Si detectas que una recomendación aquí no coincide con `react.dev` vigente:

1. Verifica en https://react.dev y el blog.
2. Confirma con el usuario.
3. **Actualiza este archivo** con la fecha y la fuente.

Última actualización: 2026-04-29.
