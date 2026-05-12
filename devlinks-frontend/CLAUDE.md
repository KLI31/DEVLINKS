# AGENTS.md — DevLinks

> Guía operativa para agentes de IA (Claude Code, Cursor, Codex, Copilot, etc.) que trabajen sobre este repositorio. Léelo antes de proponer cambios o generar código.

---

## 1. Qué es este proyecto

**DevLinks** es una plataforma tipo Linktree **diseñada exclusivamente para developers**, con integración nativa de GitHub stats, analíticas por link y QR code. Producto de Nova 11 Labs.

- Frontend: **Next.js 16** (App Router) + Tailwind + shadcn/ui
- Backend: **NestJS** + Prisma + PostgreSQL + Redis
- Auth: JWT (access 15min + refresh 7 días) + OAuth GitHub
- Deploy: Docker + GitHub Actions → `devlinks.nova11labs.dev`

Estado actual: **fase de planificación / pre-implementación**. Esta bóveda contiene la documentación de producto, diseño y arquitectura. El código aún no existe.

---

## 2. Estructura de la bóveda

**Ubicación de la bóveda de Obsidian (raíz del proyecto):**

```
C:\Users\lramb\Documents\Nova 11 Labs\Nova 11 Labs\Desarrollo Nova\DevLink
```

Toda la documentación del producto vive aquí. Los links `[[archivo]]` y wikilinks de Obsidian se resuelven contra esta ruta. Cuando el agente cree, edite o referencie archivos `.md`, debe hacerlo dentro de este árbol.

```
DevLink/
├── 00-overview/        Visión, roadmap, decisiones (ADRs), análisis
├── 01-product/         Personas, scope MVP, features, user stories, competitive
├── 02-design/          Design system, wireframes, UX decisions, brief para IA
├── 03-backend/         API, schema DB, auth, lógica de negocio
├── 04-frontend/        Componentes, rutas, estado, SEO, folder structure
├── 05-devops/          Docker, CI/CD, env vars
├── 06-testing/         Estrategia de pruebas y bugs
├── 07-integrations/    GitHub API, QR, geo-IP, email
├── 08-journal/         Dev log diario y weekly reviews
└── 09-resources/       Snippets, comandos, referencias
```

**Cada archivo `.md` termina con una sección "Notas relacionadas"** con links tipo `[[archivo]]` (formato Obsidian). Mantener este patrón al crear nuevos documentos.

---

## 3. Documentos críticos (lee primero)

Antes de cualquier tarea no trivial, consulta:

1. `00-overview/README.md` — visión general
2. `00-overview/analisis-mejoras.md` — qué se está mejorando y por qué
3. `01-product/mvp-scope.md` — qué entra y qué NO en el MVP
4. `02-design/design-system.md` — tokens visuales (paleta, tipografía, espaciado)
5. `02-design/brief-diseno-ia.md` — especificación de UI por pantalla
6. `02-design/ux-decisions.md` — decisiones de UX justificadas (no las contradigas sin razón)

---

## 4. Reglas de oro

### 4.1 Producto

- **No expandas el scope del MVP** sin que el usuario lo pida explícitamente. Lo que está en `mvp-scope.md` como "Fuera del MVP" no se implementa todavía.
- **El diferenciador es GitHub-first.** Cualquier decisión de UI/UX debe priorizar la visibilidad de las stats de GitHub. No trates las stats como un widget secundario.
- Audiencia objetivo: developers (Andrés/Valentina/Felipe en `personas.md`). Si una decisión no resuena con ellos, replantéala.

### 4.2 Diseño

- **JetBrains Mono es la fuente principal de toda la UI.** Inter es secundaria, solo para textos largos (bios > 40 chars, párrafos de marketing).
- **Dark mode por defecto.** Light mode es post-MVP.
- Usa **exactamente** los tokens de `design-system.md` — no inventes colores ni tamaños.
- Respeta `prefers-reduced-motion` en cualquier animación.
- Tap targets ≥ 44px en móvil. Lighthouse mobile > 90 es objetivo de MVP.
- WCAG AA mínimo (contraste verificado).

### 4.3 Código

- **Frontend**: TypeScript estricto, server components por defecto, client components solo cuando se necesite interactividad.
- **Backend**: NestJS con módulos por dominio (auth, users, links, analytics, github, qr).
- **Validación**: `zod` (frontend) + `class-validator` (NestJS). Schemas compartidos cuando sea posible.
- **Forms**: `react-hook-form` + `zod`.
- **Drag-and-drop**: `@dnd-kit/core` (accesible por teclado). Debounce de 500ms al guardar el orden.
- **Toasts**: `sonner`. Mensajes en español.
- **Tracking de clics**: fire-and-forget (no bloquear redirect). Ver `ux-decisions.md` UX-002.
- **Cache de GitHub API**: 6h en Redis. Mostrar "actualizado hace X" en el perfil.
- **JWT**: access token 15min en memoria/Zustand, refresh 7 días en cookie httpOnly.

### 4.4 Convenciones

- **Idioma**: el código y los identificadores en **inglés**. La documentación, comentarios de UX y mensajes de UI en **español**.
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- **Branches**: `feat/<area>-<descripcion>`, `fix/<area>-<descripcion>`.
- **PRs**: descripción con qué/por qué/cómo + checklist de testing manual.
- **Naming**:
  - Componentes: `PascalCase.tsx`
  - Hooks: `useCamelCase.ts`
  - Endpoints REST: `/recurso` plural, kebab-case (`/auth/refresh-token`)
  - DB: `snake_case` en columnas, `PascalCase` en modelos Prisma

### 4.5 Lo que NO hacer

- ❌ No agregues dependencias sin discutirlo (especialmente UI libs que dupliquen shadcn).
- ❌ No copies estética de Linktree/Bento — debe sentirse "para developers".
- ❌ No implementes features del roadmap post-MVP sin pedirlo.
- ❌ No uses gradientes saturados, glassmorphism exagerado, ni emojis decorativos en UI productiva.
- ❌ No subas secrets al repo. `.env.example` siempre, `.env` nunca.
- ❌ No hagas refactors masivos junto a un fix — un PR, un propósito.
- ❌ No hagas comentarios en el JSX, solo comentarios que generen valor

---

## 5. Flujo de trabajo recomendado para agentes

1. **Lee la documentación relevante** según la tarea (sección 3).
2. **Confirma el scope** con el usuario si la tarea toca múltiples áreas o ambigüedades.
3. **Propón un plan corto** antes de codear si la tarea no es trivial.
4. **Implementa** respetando las reglas de oro.
5. **Documenta** el cambio si afecta arquitectura o decisiones (ADR en `00-overview/decisiones.md`).
6. **Actualiza el journal** (`08-journal/`) si hiciste un avance significativo.

---

## 6. Tareas comunes y su fuente de verdad

| Tarea                    | Lee primero                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------- |
| Diseñar/implementar UI   | `02-design/brief-diseno-ia.md`, `02-design/design-system.md`, `02-design/wireframes.md` |
| Crear endpoint API       | `03-backend/` (cuando exista), `01-product/features-v1.md`                              |
| Agregar componente React | `04-frontend/components.md`, `04-frontend/folder-structure.md`                          |
| Modificar rutas          | `04-frontend/routes-pages.md`                                                           |
| Cambiar lógica de auth   | `01-product/mvp-scope.md` (sección Auth), `ux-decisions.md`                             |
| Tocar integración GitHub | `07-integrations/`, `01-product/mvp-scope.md` (sección GitHub Integration)              |
| Cambios de UX            | proponer un nuevo bloque en `02-design/ux-decisions.md` con justificación               |

---

## 7. Schema canónico de perfil (para import/export JSON)

Esta es la forma canónica del perfil de un usuario. Úsala como contrato entre frontend, backend y la feature de import/export.

```json
{
  "username": "andresdev",
  "displayName": "Andrés Ramírez",
  "bio": "Frontend Dev • TypeScript & React",
  "avatarUrl": "https://github.com/andresdev.png",
  "github": "andresdev",
  "theme": "default",
  "links": [
    {
      "title": "GitHub",
      "url": "https://github.com/andresdev",
      "icon": "github",
      "isActive": true
    }
  ]
}
```

**Validaciones:**

- `username`: 3-30 chars, `[a-z0-9_-]`, único.
- `bio`: máx 160 chars.
- `links`: máx 20 items en MVP.
- `icon`: uno de los keys definidos en `design-system.md` (sección "Íconos para links").

---

## 8. Métricas que importan

El éxito del MVP se mide por:

- ≥ 10 perfiles reales creados
- Tiempo de carga del perfil público < 2s
- Lighthouse mobile > 90
- 7 días sin errores críticos en producción

Métricas adicionales a instrumentar (de `analisis-mejoras.md`):

- Tasa de finalización del onboarding
- % usuarios que conectan GitHub
- CTR promedio por perfil
- Tiempo medio entre signup y primer share del link

---

## 9. Contacto y autoría

- **Owner:** Nova 11 Labs
- **Bóveda Obsidian:** `C:\Users\lramb\Documents\Nova 11 Labs\Nova 11 Labs\Desarrollo Nova\DevLink`
- **Repositorio:** _pendiente_
- **Dominio:** `devlinks.nova11labs.dev`

---

## 10. Cambios a este documento

Si descubres una regla nueva, una convención o una decisión que un agente futuro debería conocer, **actualiza este archivo**. Mantenerlo vivo es lo que lo hace útil.

Última actualización: 2026-04-29.
