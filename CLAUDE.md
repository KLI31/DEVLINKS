# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DevLinks is a Linktree-style platform built for developers, with GitHub stats integration, analytics, and QR codes. Product of Nova 11 Labs. The stack is a Docker-based monorepo:

- **Frontend**: `devlinks-frontend/` — Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui
- **Backend**: `devlinks-backend/` — NestJS 11, Prisma 6, PostgreSQL 16, Redis 7
- **Proxy**: Nginx routes `/api/*` → backend:3001, everything else → frontend

## Commands

All day-to-day operations go through `make`. Run `make help` for the full list.

```bash
make up              # Start all services (Docker)
make down            # Stop all services
make build           # Rebuild all containers
make logs            # Tail logs for all services
make logs-backend    # Tail backend only

make migrate name=<migration_name>   # Create + apply a Prisma migration
make migrate-status  # Check migration state
make generate        # Regenerate Prisma client after schema change
make studio          # Open Prisma Studio at localhost:5555
make migrate-reset   # DANGER: wipe DB (dev only, prompts confirmation)

make test            # Backend unit tests (inside container)
make test-watch      # Unit tests in watch mode
make test-cov        # Unit tests with coverage report
make test-e2e        # Playwright E2E tests (runs from local, not container)
make lint            # Lint backend + frontend

make shell-backend   # sh into backend container
make shell-db        # psql into PostgreSQL
make shell-redis     # redis-cli
```

First-time setup: `make setup` (copies env files, starts containers, runs initial migration).

To run backend tests for a single file without Docker:
```bash
cd devlinks-backend && npx jest src/modules/auth/auth.service.spec.ts
```

## Architecture

### Request flow

Browser → Nginx (`:80`) → Next.js frontend OR backend API at `/api/*`

Next.js also rewrites `/api/:path*` to `NEXT_PUBLIC_API_URL` for SSR requests. The backend is at port 3001 internally and never exposed directly in production.

### Backend module structure

`devlinks-backend/src/modules/` contains five domain modules:

| Module | Responsibility |
|---|---|
| `auth` | JWT (15min access / 7d refresh), GitHub OAuth, bcrypt |
| `user` | Profile CRUD, customization settings |
| `link` | Link CRUD, ordering (drag-and-drop persisted) |
| `github` | GitHub API integration, stats cached 6h in Redis |
| `analytics` | Click tracking, profile view tracking |

Shared infrastructure: `PrismaModule` (global), `RedisModule` (global), `ThrottlerModule` (Redis-backed, 100 req/min default), global `ExceptionFilter`, `ValidationPipe` (whitelist + transform).

Swagger docs available at `/api/docs` when `ENABLE_SWAGGER=true`.

### Frontend structure

```
app/
├── (auth)/          # Login / Register (unauthenticated)
├── dashboard/       # Protected area: links, analytics, customize, settings
├── u/[slug]/        # Public profile page (SSR)
└── api/             # Route handlers: user/me, location-suggestion
components/          # Shared React components
hooks/               # Custom hooks (useCamelCase.ts)
lib/                 # API clients, Zod schemas, server actions
store/               # Zustand stores (auth-store: access token in memory)
types/               # TypeScript type definitions
```

Server components by default; add `"use client"` only when interactivity is needed.

### Auth pattern

- **Access token**: stored in Zustand (memory only), 15-minute TTL
- **Refresh token**: httpOnly cookie, 7-day TTL, rotated on each use, stored in `RefreshToken` DB table
- GitHub OAuth login goes through `/api/auth/github` → callback → issues both tokens

### Database (Prisma)

Schema at `devlinks-backend/prisma/schema.prisma`. Key models: `User`, `Link`, `LinkAnalytic`, `Project`, `RefreshToken`, `ProfileView`.

User customization fields live directly on `User` (theme, accentColor, buttonStyle, fontFamily, bgType, titleFont, buttonVariant, buttonRadius, buttonShadow, stickers, etc.).

After any schema change: `make migrate name=<descriptive_name>` then `make generate`.

## Key conventions

**Language**: code and identifiers in English; UI messages, toasts, and comments in Spanish.

**Naming**:
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- REST endpoints: plural kebab-case (`/auth/refresh-token`, `/links`)
- DB columns: `snake_case`; Prisma models: `PascalCase`

**Commits**: Conventional Commits — `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
**Branches**: `feat/<area>-<desc>`, `fix/<area>-<desc>`.

**Forms**: `react-hook-form` + `zod` (frontend); `class-validator` + `class-transformer` (backend DTOs).

**Toasts**: `sonner`, messages in Spanish.

**Drag-and-drop**: `@dnd-kit/core` — debounce order saves by 500ms.

**GitHub cache**: 6h in Redis. Always show "updated X ago" on the profile.

**Link click tracking**: fire-and-forget — never block the redirect.

## Design rules

- JetBrains Mono is the primary font across the entire UI. Inter is secondary, only for long prose (bios > 40 chars).
- Dark mode is the default (and only mode for MVP).
- No saturated gradients, excessive glassmorphism, or decorative emojis in production UI.
- Tap targets ≥ 44px on mobile. Respect `prefers-reduced-motion`.
- GitHub stats are the key differentiator — never treat them as a secondary widget.

## Do not

- Add new UI dependencies that duplicate shadcn/ui functionality.
- Implement post-MVP roadmap features without being asked.
- Combine refactors with bug fixes in the same PR.
- Commit `.env` files — only `.env.example`.
