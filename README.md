# DevLinks

Plataforma fullstack tipo **Linktree para desarrolladores**. Permite crear un perfil público centralizado con enlaces a redes sociales, proyectos de GitHub y métricas de visitas.

---

## 📋 Requisitos Previos

- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- [Make](https://www.gnu.org/software/make/) (GNU Make)
- **Windows:** Es recomendable usar **Git Bash** o **WSL** ya que el `Makefile` utiliza sintaxis específica de Bash (`cp -n`, `sleep`, `read`, etc.).
- **Node.js 20+** (solo si prefieres desarrollo local sin Docker)

---

## 🏗️ Stack Tecnológico

### Frontend (`devlinks-frontend/`)
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI:** [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **Estado:** [Zustand 5](https://zustand-demo.pmnd.rs/)
- **Formularios:** [React Hook Form](https://react-hook-form.com/) + [Zod 4](https://zod.dev/)
- **Animaciones:** [Motion](https://motion.dev/) (Framer Motion)
- **Mapas:** [MapLibre GL](https://maplibre.org/)
- **Gráficos:** [Recharts](https://recharts.org/)

### Backend (`devlinks-backend/`)
- **Framework:** [NestJS 11](https://nestjs.com/)
- **ORM:** [Prisma 6](https://www.prisma.io/)
- **Base de datos:** [PostgreSQL 16](https://www.postgresql.org/)
- **Caché:** [Redis 7](https://redis.io/)
- **Autenticación:** JWT + OAuth 2.0 con GitHub
- **Seguridad:** Helmet, Bcrypt, Rate Limiting (`@nestjs/throttler`)
- **Testing:** Jest 30, Supertest

### Infraestructura
- **Contenedores:** Docker & Docker Compose
- **Proxy inverso:** Nginx (Alpine)
- **Orquestación:** `Makefile`

---

## 🚀 Primeros Pasos (Docker + Make)

El método recomendado para ejecutar el proyecto es usando Docker Compose a través del `Makefile`.

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd DevLink-project
```

### 2. Configurar Variables de Entorno

> ⚠️ **Nota importante:** No existen archivos `.env.example` en el repositorio actualmente. Crea los archivos manualmente basándote en las tablas de abajo.

**Backend** — Crear `devlinks-backend/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://devlinks:devlinks_pass@postgres:5432/devlinks_db
REDIS_URL=redis://redis:6379
JWT_SECRET=tu_jwt_secret_aqui
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRY=7d
GITHUB_CLIENT_ID=tu_github_client_id
GITHUB_CLIENT_SECRET=tu_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
ENCRYPTION_KEY=tu_encryption_key_aqui
FRONTEND_URL=http://localhost
```

**Frontend** — Crear `devlinks-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_APP_URL=http://localhost
```

### 3. Levantar el Proyecto

```bash
make setup   # Primera vez: crea contenedores, aplica migraciones iniciales
make up      # Levantar todos los servicios
```

### 4. Acceder a la Aplicación

| Servicio | URL |
|----------|-----|
| Aplicación Web | [http://localhost](http://localhost) |
| API vía Nginx | [http://localhost/api](http://localhost/api) |
| Prisma Studio | `make studio` → [http://localhost:5555](http://localhost:5555) |

---

## 🛠️ Comandos Útiles (Makefile)

| Comando | Descripción |
|---------|-------------|
| `make setup` | Configuración inicial (env, contenedores, migraciones) |
| `make up` | Iniciar todos los servicios en segundo plano |
| `make down` | Detener todos los servicios |
| `make logs` | Ver logs de todos los servicios en tiempo real |
| `make logs-backend` | Ver logs solo del backend |
| `make logs-frontend` | Ver logs solo del frontend |
| `make restart` | Reiniciar todos los servicios |
| `make build` | Reconstruir imágenes de Docker |
| `make studio` | Abrir Prisma Studio para gestionar la base de datos |
| `make migrate name=<descripcion>` | Crear y aplicar una nueva migración |
| `make migrate-status` | Ver estado de las migraciones |
| `make migrate-reset` | **⚠️ Resetear la base de datos** |
| `make test` | Ejecutar tests unitarios del backend |
| `make test-watch` | Ejecutar tests en modo watch |
| `make test-cov` | Ejecutar tests con reporte de cobertura |
| `make test-e2e` | Ejecutar tests E2E con Playwright |
| `make lint` | Ejecutar linters en backend y frontend |

---

## 💻 Desarrollo Local (sin Docker)

Si prefieres no usar Docker, asegúrate de tener **PostgreSQL** (puerto `5433`) y **Redis** (puerto `6379`) corriendo localmente.

### Backend

```bash
cd devlinks-backend
npm install
npx prisma migrate dev
npm run start:dev   # Disponible en http://localhost:3001
```

### Frontend

```bash
cd devlinks-frontend
npm install
npm run dev         # Disponible en http://localhost:3000
```

---

## 📁 Estructura del Proyecto

```
DevLink-project/
├── devlinks-backend/          # API NestJS
│   ├── src/
│   │   ├── modules/           # Módulos de dominio (auth, user, link, analytics, github)
│   │   ├── common/            # Utilidades compartidas
│   │   ├── config/            # Configuración
│   │   ├── prisma/            # Servicio Prisma
│   │   └── redis/             # Servicio Redis
│   └── prisma/                # Esquema y migraciones de Prisma
├── devlinks-frontend/         # Aplicación Next.js
│   ├── app/                   # Rutas y layouts (App Router)
│   ├── components/            # Componentes React
│   ├── lib/                   # API clients, validaciones (Zod), Server Actions
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   └── public/                # Assets estáticos
├── nginx/                     # Configuración de Nginx
├── docker-compose.yml         # Orquestación de desarrollo
├── docker-compose.prod.yml    # Orquestación de producción
└── Makefile                   # Comandos de automatización
```

---

## 🔐 Autenticación

- **JWT:** Tokens de acceso con expiración de 15 minutos.
- **Refresh Token:** Tokens de refresco con expiración de 7 días.
- **GitHub OAuth:** Registro e inicio de sesión mediante cuenta de GitHub. Es necesario crear una [OAuth App en GitHub](https://github.com/settings/developers) y configurar las variables `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` y `GITHUB_CALLBACK_URL`.

---

## ⚠️ Notas Importantes

1. **Makefile en Windows:** El `Makefile` utiliza comandos de Bash. En Windows nativo es muy probable que falle; se recomienda usar **Git Bash**, **WSL** o una terminal Unix-like.
2. **Rutas del Makefile:** Algunas referencias dentro del `Makefile` apuntan a `backend/` y `frontend/` en lugar de `devlinks-backend/` y `devlinks-frontend/`. Puede ser necesario ajustar las rutas si ciertos comandos fallan.
3. **Variables de Entorno:** Actualmente no existen archivos `.env.example`. Se recomienda crearlos a partir de la documentación de arriba.
4. **Seguridad:** El archivo `devlinks-backend/.env` contiene credenciales sensibles (OAuth, JWT, etc.) y **está presente en el repositorio**. Se recomienda rotar estas credenciales y agregar `.env` a `.gitignore` lo antes posible.
5. **Frontend Build:** El `Dockerfile.prod` del frontend espera el output en modo `standalone` de Next.js. Asegúrate de que `next.config.ts` contenga `output: 'standalone'` para que la imagen de producción funcione correctamente.

---

## 🧪 Testing

```bash
# Backend (unitarios)
make test
make test-watch
make test-cov

# E2E (Playwright)
make test-e2e
```

---

## 📜 Convenciones del Proyecto

- **Idioma de la interfaz:** Español.
- **Código e identificadores:** Inglés.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/)
  - Ejemplos: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- **Ramas:** `feat/<area>-<descripcion>`, `fix/<area>-<descripcion>`.

---
