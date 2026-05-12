# NEXTJS-BEST-PRACTICES.md — DevLinks Frontend

> Guía de buenas prácticas de **Next.js 16 (App Router)** para agentes de IA que trabajen en este repo.
> Si una práctica aquí descrita no te resulta familiar, **NO improvises**: investiga primero (docs oficiales, changelog, RFCs) y confirma antes de codear.

---

## 0. Regla cero — Investiga antes de inventar

Si te encuentras con cualquiera de estos casos, **detente y consulta documentación oficial** antes de generar código:

- No conoces la API exacta de Next.js 16 (App Router cambió mucho desde 13/14/15).
- No estás seguro de si algo es Server Component o Client Component.
- Dudas sobre la firma de `cookies()`, `headers()`, `params`, `searchParams` (en Next 15+ son **async** y deben ser `await`-eados).
- No sabes si una API es estable, experimental o deprecada.

**Fuentes oficiales obligatorias** (en este orden):

1. https://nextjs.org/docs — documentación canónica (App Router).
2. https://nextjs.org/blog — changelog y release notes por versión.
3. Repositorio `vercel/next.js` en GitHub (issues, RFCs y discusiones).
4. https://react.dev — para Server Components, `use`, `useActionState`, `useOptimistic`, etc.

Si tras consultar sigue habiendo ambigüedad, **pregunta al usuario**. No adivines.

---

## 1. Arquitectura: Server-first

- **Server Components por defecto.** Solo añade `"use client"` cuando necesites:
  - Estado (`useState`, `useReducer`).
  - Efectos (`useEffect`, `useLayoutEffect`).
  - Event handlers de navegador (`onClick`, `onChange`, etc.).
  - APIs del browser (`window`, `localStorage`, `IntersectionObserver`).
- **Empuja `"use client"` lo más abajo posible** en el árbol. Mantén layouts y páginas como Server Components.
- **Pasa Server Components como `children`** a Client Components para evitar serializar árboles grandes.
- No marques un componente como cliente "por si acaso". Cada `"use client"` es un coste de bundle.

---

## 2. Data fetching

- **Fetch en Server Components** siempre que sea posible. Usa `async function` directamente en el componente.
- **No fetch en `useEffect`** salvo casos genuinamente client-only (datos en tiempo real, dependencias del browser).
- **Caché y revalidación** — entiende y declara explícitamente:
  - `fetch(url, { cache: 'force-cache' | 'no-store' })`
  - `fetch(url, { next: { revalidate: 60, tags: ['links'] } })`
  - `revalidateTag('links')` / `revalidatePath('/dashboard')` tras mutaciones.
- En Next 15+, `fetch` ya **no se cachea por defecto**. Si necesitas cache, decláralo.
- Para datos del usuario autenticado, usa `cookies()` / `headers()` (son **async**, requieren `await`).
- **Streaming + Suspense**: envuelve secciones lentas en `<Suspense fallback={...}>` para mejorar TTFB.

---

## 3. Mutaciones: Server Actions

- Usa **Server Actions** (`"use server"`) para mutaciones desde formularios y handlers.
- Valida con **Zod** dentro de la action antes de tocar el backend.
- Tras mutar, llama `revalidateTag` / `revalidatePath` o `redirect()`.
- Para UX optimista usa `useOptimistic` (React 19+).
- Para estado de form usa `useActionState` (antes `useFormState`, **renombrado**: revisa la versión).
- **Nunca** expongas secretos en una Server Action devuelta al cliente. La función se ejecuta en el server, pero su firma se serializa.

---

## 4. Routing y archivos especiales

Conoce y usa correctamente:

- `layout.tsx` — UI compartida, **no se re-renderiza** en navegación entre hijos.
- `template.tsx` — como layout pero **sí** se remonta en cada navegación.
- `loading.tsx` — fallback automático con Suspense.
- `error.tsx` — error boundary (debe ser Client Component).
- `not-found.tsx` — UI 404 personalizada; se invoca con `notFound()`.
- `route.ts` — Route Handlers (API). Exporta `GET`, `POST`, etc.
- `middleware.ts` — corre en Edge runtime; mantenlo ligero.
- **Route Groups** `(grupo)` — agrupan sin afectar la URL.
- **Parallel routes** `@slot` y **Intercepting routes** `(.)`, `(..)` — solo si los necesitas y entiendes.

`params` y `searchParams` en páginas son **async** desde Next 15. Tipo correcto:

```tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
}
```

---

## 5. Metadata y SEO

- Usa la **Metadata API** (`export const metadata` o `generateMetadata`) — **no** `<Head>`.
- `generateMetadata` puede ser async y leer `params`.
- Usa `app/sitemap.ts`, `app/robots.ts`, `app/icon.tsx`, `app/opengraph-image.tsx` para assets dinámicos.
- En perfiles públicos (`/u/[slug]`) genera OG image dinámica con `ImageResponse` desde `next/og`.

---

## 6. Imágenes, fuentes y assets

- **`next/image`** siempre — define `width`, `height` (o `fill` con contenedor relativo). Configura `remotePatterns` en `next.config.ts` para hosts externos (GitHub avatars, etc.).
- **`next/font`** para fuentes — JetBrains Mono e Inter deben cargarse por aquí, nunca por `<link>` manual.
- Static assets en `public/`. Importaciones de SVG como componentes solo si configuras un loader.

---

## 7. Performance

- **Bundle hygiene**:
  - `next/dynamic` con `ssr: false` solo para libs que rompen en server (ej. ciertos editores).
  - Evita re-exportar libs grandes desde un barrel `index.ts` — rompe tree-shaking.
- **Partial Prerendering (PPR)** — si está habilitado en el proyecto, entiende qué partes son estáticas y cuáles dinámicas.
- **`Link` con `prefetch`** — por defecto está activo; desactívalo en links que el usuario rara vez visita.
- Mide con **Lighthouse mobile** (objetivo > 90 según `CLAUDE.md`) y **Web Vitals** (`useReportWebVitals`).

---

## 8. TypeScript

- `strict: true` en `tsconfig.json`. No uses `any`.
- Tipa `params` y `searchParams` como `Promise<...>` (Next 15+).
- Tipa Server Actions: `(prevState, formData) => Promise<State>` cuando uses `useActionState`.
- Para esquemas compartidos con backend, deriva tipos desde Zod (`z.infer<typeof schema>`).

---

## 9. Errores y observabilidad

- `error.tsx` para errores de render.
- `global-error.tsx` para errores que tumban el root layout.
- Loguea con un servicio (Sentry/Logtail) — **no** `console.log` en producción.
- En Server Actions, devuelve errores estructurados; no lances strings.

---

## 10. Seguridad

- **Nunca** importes módulos server-only desde un Client Component. Usa `import 'server-only'` en utilidades sensibles para que el bundler falle si se cuela al cliente.
- **Nunca** pongas secretos en variables `NEXT_PUBLIC_*` — esas se serializan al bundle del browser.
- Cookies de auth: `httpOnly`, `secure`, `sameSite: 'lax'` (o `'strict'` cuando aplique). Refresh token va en cookie, **nunca** en localStorage.
- Sanitiza cualquier HTML de usuario antes de renderizar (`dangerouslySetInnerHTML` solo si pasaste por un sanitizador como DOMPurify).
- CSRF: Server Actions traen protección de origin; no la desactives.

---

## 11. Convenciones específicas de DevLinks

(Coherentes con `CLAUDE.md`. Si hay conflicto, manda `CLAUDE.md`.)

- TS estricto, Server Components por defecto.
- `react-hook-form` + `zod` para forms.
- `@dnd-kit/core` para drag-and-drop, debounce 500ms al guardar orden.
- `sonner` para toasts, mensajes en **español**.
- Tracking de clics: **fire-and-forget**, no bloquear redirect.
- Cache GitHub API: 6h en Redis (backend); en frontend usa `next: { revalidate: 21600, tags: ['github', username] }`.
- JWT access en memoria/Zustand (15min), refresh en cookie httpOnly (7d).

---

## 12. Checklist antes de abrir PR

- [ ] ¿Cada `"use client"` está justificado?
- [ ] ¿Los `params` / `searchParams` / `cookies()` / `headers()` están `await`-eados?
- [ ] ¿Las mutaciones llaman `revalidateTag` o `revalidatePath`?
- [ ] ¿La página tiene `loading.tsx` y `error.tsx` cuando aplica?
- [ ] ¿Hay `metadata` o `generateMetadata`?
- [ ] ¿Las imágenes usan `next/image` con `width`/`height` o `fill`?
- [ ] ¿No hay secretos en `NEXT_PUBLIC_*`?
- [ ] ¿Lighthouse mobile > 90 en la ruta tocada?
- [ ] ¿WCAG AA, tap targets ≥ 44px, `prefers-reduced-motion` respetado?

---

## 13. Si algo de esta guía está desactualizado

Next.js evoluciona rápido. Si detectas que una recomendación aquí no coincide con la documentación oficial vigente:

1. Verifica en https://nextjs.org/docs y el blog de releases.
2. Confirma con el usuario.
3. **Actualiza este archivo** con la fecha y la fuente.

Última actualización: 2026-04-29.
