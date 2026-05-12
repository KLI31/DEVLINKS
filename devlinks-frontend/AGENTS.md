# AGENTS.md — DevLinks

> Guidelines for AI agents working in this repository. Read this before making changes.

## Project Overview

**DevLinks** — A Linktree-style platform designed exclusively for developers, with native GitHub stats, per-link analytics, and QR codes. Product of Nova 11 Labs.

- **Frontend**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui
- **Backend**: NestJS + Prisma + PostgreSQL + Redis
- **Auth**: JWT (access 15min + refresh 7 days) + OAuth GitHub
- **Deploy**: Docker + GitHub Actions → `devlinks.nova11labs.dev`

Frontend code lives in `devlinks-frontend/`. Backend is separate (not in this repo).

## Knowledge Base & Skills

Before starting any task, **check these documentation files** in the repo root:

- `CLAUDE.md` — Product vision, design system tokens, MVP scope, UX decisions, persona definitions
- `NEXTJS-BEST-PRACTICES.md` — Next.js 16 App Router patterns, Server Actions, routing, caching
- `REACT-ARCHITECTURE-BEST-PRACTICES.md` — React 19 patterns, state management, component architecture, hooks

**Load the relevant skill** when working on:

- **Next.js / App Router** → `next-best-practices`
- **Tailwind CSS v4** → `tailwind-v4-shadcn` (production setup with theme tokens)
- **React patterns** → `vercel-react-best-practices`
- **Forms** → `react-hook-form`
- **Validation** → `zod`
- **shadcn/ui components** → `shadcn`
- **Frontend design** → `frontend-design`
- **Accessibility** → `accessibility`

> If a skill exists for the area you're working on, load it before writing code.

## Commands

```bash
# Development
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build with type checking
npm run start        # Start production server
npm run lint         # Run ESLint (eslint-config-next/core-web-vitals + typescript)
```

> **No test runner is installed yet.** If adding tests, use Vitest or Jest and add the command here.

Always run `npm run lint` before finishing. TypeScript checking happens during `next build` and in the IDE.

## Code Style

### TypeScript
- Strict mode enabled. **Never use `any`** — prefer `unknown` with type guards.
- Use `interface` for component props, store state, and class-like shapes.
- Use `type` for API response shapes, unions, and `z.infer<...>`.
- Prefer explicit return types on exported functions in `lib/api/`.

### Naming Conventions
- **Files/folders**: kebab-case (`login-form.tsx`, `auth.api.ts`, `link.schema.ts`)
- **Components**: PascalCase (`LoginForm`, `LinksClient`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Stores**: camelCase with `use` prefix and `Store` suffix (`useAuthStore`)
- **Utility functions**: camelCase (`cn`, `getProfileUrl`)
- **Zod schemas**: camelCase (`linkSchema`)
- **API modules**: `*.api.ts` pattern (`auth.api.ts`)
- **Endpoints**: plural resources, kebab-case (`/auth/refresh-token`)

### Imports Order
1. React / Next.js builtins
2. Third-party libraries
3. `@/` aliases (components, hooks, lib, stores)
4. Relative imports (only when unavoidable)
5. Use `import type { ... }` for type-only imports

### Formatting
- No Prettier config — follow existing file patterns.
- Single quotes for strings, double quotes for JSX attributes.
- Trailing commas in multiline objects/arrays.
- 2-space indentation.

### Comments
- **Comment complex logic only.** If the code is self-explanatory, do not add a comment.
- Use comments to explain **why** something is done, not **what** it does.
- **Do NOT use comments inside JSX.** Keep explanations in standard TypeScript comments outside the JSX or in a separate note.

## React & Next.js Rules

### Server vs Client Components
- **Default to Server Components.** Add `"use client"` ONLY for:
  - `useState`, `useEffect`, browser APIs
  - Event handlers (`onClick`, `onChange`)
  - Client-only libraries (drag-and-drop, charts, animations)
- Add `"use server"` at the top of Server Actions in `lib/actions/`.
- Never fetch private data directly from Client Components.

### Data Fetching
- Server Components: fetch directly with `apiCall()` or `fetch()`, no `useEffect`.
- Use `Suspense` + fallback components for async boundaries.
- Use `revalidatePath()` / `revalidateTag()` after mutations.
- Dynamic routes: `params` is a `Promise` in Next.js 16 — always `await params`.

### Route Groups
- `(auth)/` — no sidebar, no session checks
- `(dashboard)/` — shared layout with sidebar + topbar; auth check in layout
- Public profiles under `u/[slug]/` are Server Components

## Styling (Tailwind CSS v4)

- Theme tokens live in `app/globals.css` via `@theme inline` and CSS variables. **Reference `app/globals.css` for all available theme tokens.**
- **Never hardcode colors** — use theme utilities (`bg-primary`, `text-foreground`).
- Use `cn()` from `lib/utils.ts` for conditional classes. **Never concatenate strings** for classNames.
- shadcn/ui components live in `components/ui/` — **do not edit them directly**. Wrap them instead.
- Custom animations go in `globals.css` inside `@theme inline`.
- Respect `prefers-reduced-motion` for all animations.
- Tap targets ≥ 44px on mobile. WCAG AA minimum contrast.
- **Always use theme variables from `app/globals.css`** — never hardcode colors, sizes, spacing, or shadows. Use CSS custom properties and `@theme inline` tokens (e.g., `bg-primary`, `text-foreground`, `shadow-hover`).

## State & Logic

### Zustand
- One store per domain (`auth-store.ts`, `links-store.ts`).
- Use `persist` middleware only when necessary; keep sensitive data out of localStorage.
- Prefer local `useState` for ephemeral UI state.

### Forms
- Use `react-hook-form` + `zodResolver` + Zod schemas from `lib/validations/`.
- Set `mode: "onTouched"` for validation timing.
- Export schema and inferred type together: `export type LinkFormValues = z.infer<typeof linkSchema>`.

### API Client
- Use `apiCall<T>()` from `lib/api/client.ts` for all HTTP requests.
- API modules go in `lib/api/` with naming `*.api.ts`.
- Re-export from `lib/api/index.ts` for clean imports.
- Handle 401 refresh logic inside `apiCall` — do not duplicate it.

### Error Handling
- Client: wrap async calls in `try/catch`, show errors with `toast.error()` from `sonner`.
- Server Actions: throw user-friendly strings; let the caller handle toasts.
- Use `resolveErrorMessage()` from `lib/messages.ts` to normalize unknown errors.

## Project Conventions

### Language
- **UI copy is in Spanish.** Keep labels, placeholders, and toasts in Spanish.
- **Code, identifiers, and commit messages in English.** Documentation and UX comments in Spanish.

### Commits
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Branches: `feat/<area>-<descripcion>`, `fix/<area>-<descripcion>`

### Security
- Never log or expose secrets, tokens, or passwords.
- Never commit `.env.local` — it is in `.gitignore`.
- `NEXT_PUBLIC_*` variables are exposed to the browser — do not put secrets there.

## File Structure

```
devlinks-frontend/
  app/
    (auth)/, (dashboard)/    # Route groups
    u/[slug]/                # Public profiles (Server Components)
  components/
    ui/                      # shadcn/ui — read-only
    layout/                  # Layout components (Header, etc.)
  lib/
    api/                     # API modules + client + types
    validations/             # Zod schemas
    actions/                 # Server Actions
  hooks/                     # React hooks
  store/                     # Zustand stores
```

## Product Rules

- **Do not expand MVP scope** without explicit user request.
- **GitHub-first:** Prioritize GitHub stats visibility in all UI decisions.
- **Dark mode by default.** Light mode is post-MVP.
- **JetBrains Mono is the primary font.** Inter is secondary for long text only.
- Do not copy Linktree/Bento aesthetics — must feel "for developers".
- No saturated gradients, exaggerated glassmorphism, or decorative emojis in productive UI.
- One PR, one purpose. No massive refactors alongside fixes.

## Lint & Type Check

Always run before finishing:
```bash
npm run lint
```

There is no separate `typecheck` script — TypeScript checking happens during `next build` and in the IDE.
