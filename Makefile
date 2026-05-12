# Bash para que los códigos ANSI se interpreten igual que en Linux/macOS
SHELL := /bin/bash

.PHONY: help up down restart logs build clean \
        migrate migrate-prod seed studio shell-backend shell-db shell-redis \
        test test-e2e lint \
        prod-up prod-down prod-logs prod-deploy \
        setup keys

# Colores (ESC vía printf para que el terminal los interprete bien)
ESC    := $(shell printf '\033')
GREEN  := $(ESC)[0;32m
YELLOW := $(ESC)[0;33m
CYAN   := $(ESC)[0;36m
RESET  := $(ESC)[0m

# ─────────────────────────────────────────────────────────────
#  AYUDA
# ─────────────────────────────────────────────────────────────
help: ## Muestra esta ayuda
	@echo ""
	@echo "$(CYAN)DevLinks — Comandos disponibles$(RESET)"
	@echo "─────────────────────────────────"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(GREEN)%-18s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

# ─────────────────────────────────────────────────────────────
#  DESARROLLO — Ciclo básico
# ─────────────────────────────────────────────────────────────
up: ## Levantar todos los servicios en desarrollo
	@echo "Levantando DevLinks..."
	docker compose up -d
	@echo "Servicios corriendo en http://localhost$(RESET)"

down: ## Bajar todos los servicios
	@echo "Bajando servicios...$(RESET)"
	docker compose down

restart: ## Reiniciar todos los servicios
	docker compose restart

logs: ## Ver logs en tiempo real (todos los servicios)
	docker compose logs -f

logs-backend: ## Ver logs solo del backend
	docker compose logs -f backend

logs-frontend: ## Ver logs solo del frontend
	docker compose logs -f frontend

logs-db: ## Ver logs de PostgreSQL
	docker compose logs -f postgres

build: ## Rebuild de todos los contenedores
	@echo "$(CYAN)Rebuilding contenedores...$(RESET)"
	docker compose up -d --build

build-backend: ## Rebuild solo del backend
	docker compose up -d --build backend

build-frontend: ## Rebuild solo del frontend
	docker compose up -d --build frontend

build-nginx: ## Rebuild solo del nginx
	docker compose up -d --build nginx

build-redis: ## Rebuild solo el redis
	docker compose up -d --build redis

build-postgres: ## Rebuild solo el postgres
	docker compose up -d --build postgres

status: ## Ver estado de los contenedores
	docker compose ps

down-backend: ## Bajar el backend
	docker compose down backend

down-frontend: ## Bajar el frontend
	docker compose down frontend

down-nginx: ## Bajar el nginx
	docker compose down nginx

down-redis: ## Bajar el redis
	docker compose down redis
down-all: ## Bajar todos los contenedores
	docker compose down
stop-backend: ## Detener el backend
	docker compose stop backend

stop-frontend: ## Detener el frontend
	docker compose stop frontend

stop-nginx: ## Detener el nginx
	docker compose stop nginx

stop-redis: ## Detener el redis
	docker compose stop redis

stop-all: ## Detener todos los contenedores
	docker compose stop
# ─────────────────────────────────────────────────────────────
#  SETUP INICIAL
# ─────────────────────────────────────────────────────────────
setup: ## Setup completo del proyecto (primera vez)
	@echo "$(CYAN)Setup inicial de DevLinks...$(RESET)"
	@echo "$(YELLOW)1/4 Copiando archivos de entorno...$(RESET)"
	@cp -n backend/.env.example backend/.env 2>/dev/null || echo "  backend/.env ya existe"
	@cp -n frontend/.env.local.example frontend/.env.local 2>/dev/null || echo "  frontend/.env.local ya existe"
	@echo "$(YELLOW)2/4 Levantando contenedores...$(RESET)"
	docker compose up -d
	@echo "$(YELLOW)3/4 Esperando a que PostgreSQL esté listo...$(RESET)"
	@sleep 5
	@echo "$(YELLOW)4/4 Corriendo migraciones de Prisma...$(RESET)"
	docker compose exec backend npx prisma migrate dev --name init
	@echo ""
	@echo "$(GREEN)Setup completo!$(RESET)"
	@echo "  Frontend:  http://localhost"
	@echo "  API:       http://localhost/api"
	@echo "  DB Studio: make studio"

keys: ## Generar claves seguras para el .env
	@echo "$(CYAN)Claves generadas (cópialas en backend/.env):$(RESET)"
	@echo ""
	@printf "JWT_SECRET="; node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
	@printf "ENCRYPTION_KEY="; node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
	@echo ""

# ─────────────────────────────────────────────────────────────
#  BASE DE DATOS / PRISMA
# ─────────────────────────────────────────────────────────────
migrate: ## Crear y aplicar nueva migración (requiere name=nombre)
	@if [ -z "$(name)" ]; then \
		echo "$(YELLOW)Uso: make migrate name=nombre_de_la_migracion$(RESET)"; \
		exit 1; \
	fi
	docker compose exec backend npx prisma migrate dev --name $(name)

migrate-reset: ## PELIGRO: Resetear la BD completa (solo dev)
	@echo "$(YELLOW)Esto borrará todos los datos. Continuar? [s/N]$(RESET)"
	@read ans; if [ "$$ans" = "s" ]; then \
		docker compose exec backend npx prisma migrate reset --force; \
	fi

migrate-status: ## Ver estado de las migraciones
	docker compose exec backend npx prisma migrate status

studio: ## Abrir Prisma Studio en el navegador
	@echo "$(CYAN)Abriendo Prisma Studio en http://localhost:5555$(RESET)"
	docker compose exec -d backend npx prisma studio
	@sleep 2
	@open http://localhost:5555 2>/dev/null || xdg-open http://localhost:5555 2>/dev/null || echo "Abre http://localhost:5555 en tu navegador"

generate: ## Regenerar Prisma Client (después de cambiar schema)
	docker compose exec backend npx prisma generate

# ─────────────────────────────────────────────────────────────
#  SHELLS INTERACTIVOS
# ─────────────────────────────────────────────────────────────
shell-backend: ## Abrir shell en el contenedor del backend
	docker compose exec backend sh

shell-frontend: ## Abrir shell en el contenedor del frontend
	docker compose exec frontend sh

shell-db: ## Abrir psql en PostgreSQL
	docker compose exec postgres psql -U devlinks -d devlinks_db

shell-redis: ## Abrir redis-cli
	docker compose exec redis redis-cli

# ─────────────────────────────────────────────────────────────
#  TESTING
# ─────────────────────────────────────────────────────────────
test: ## Correr unit tests del backend
	docker compose exec backend npm run test

test-watch: ## Unit tests en modo watch
	docker compose exec backend npm run test:watch

test-cov: ## Unit tests con reporte de cobertura
	docker compose exec backend npm run test:cov

test-e2e: ## Correr tests E2E con Playwright (desde local)
	cd frontend && npx playwright test

lint: ## Lint de backend y frontend
	docker compose exec backend npm run lint
	docker compose exec frontend npm run lint

# ─────────────────────────────────────────────────────────────
#  INSTALACIÓN DE DEPENDENCIAS
# ─────────────────────────────────────────────────────────────
install-backend: ## Instalar dependencia en el backend (pkg=nombre)
	@if [ -z "$(pkg)" ]; then \
		echo "$(YELLOW)Uso: make install-backend pkg=nombre-paquete$(RESET)"; \
		exit 1; \
	fi
	docker compose exec backend npm install $(pkg)

install-frontend: ## Instalar dependencia en el frontend (pkg=nombre)
	@if [ -z "$(pkg)" ]; then \
		echo "$(YELLOW)Uso: make install-frontend pkg=nombre-paquete$(RESET)"; \
		exit 1; \
	fi
	docker compose exec frontend npm install $(pkg)

shadcn: ## Agregar componente de shadcn/ui (cmp=nombre)
	@if [ -z "$(cmp)" ]; then \
		echo "$(YELLOW)Uso: make shadcn cmp=button$(RESET)"; \
		exit 1; \
	fi
	docker compose exec frontend npx shadcn@latest add $(cmp)

# ─────────────────────────────────────────────────────────────
#  LIMPIEZA
# ─────────────────────────────────────────────────────────────
clean: ## Bajar servicios y eliminar volúmenes (BORRA LA BD)
	@echo "$(YELLOW)Esto eliminará todos los datos. Continuar? [s/N]$(RESET)"
	@read ans; if [ "$$ans" = "s" ]; then \
		docker compose down -v; \
		echo "$(GREEN)Limpieza completada$(RESET)"; \
	fi

clean-images: ## Eliminar imágenes Docker sin usar
	docker image prune -f

clean-all: ## Limpieza total (contenedores + volúmenes + imágenes)
	@echo "$(YELLOW)Limpieza total. Continuar? [s/N]$(RESET)"
	@read ans; if [ "$$ans" = "s" ]; then \
		docker compose down -v --rmi all; \
	fi

# ─────────────────────────────────────────────────────────────
#  PRODUCCIÓN
# ─────────────────────────────────────────────────────────────
prod-up: ## Levantar en producción
	@echo "$(CYAN)Levantando DevLinks en PRODUCCIÓN...$(RESET)"
	docker compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)Producción corriendo$(RESET)"

prod-down: ## Bajar producción
	docker compose -f docker-compose.prod.yml down

prod-build: ## Rebuild en producción
	docker compose -f docker-compose.prod.yml up -d --build

prod-logs: ## Ver logs de producción
	docker compose -f docker-compose.prod.yml logs -f --tail=100

prod-migrate: ## Aplicar migraciones en producción
	docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

prod-deploy: ## Deploy completo en producción
	@echo "$(CYAN)Deploy en producción...$(RESET)"
	git pull origin main
	docker compose -f docker-compose.prod.yml up -d --build
	docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
	docker image prune -f
	@echo "$(GREEN)Deploy completado$(RESET)"

prod-status: ## Estado de los servicios en producción
	docker compose -f docker-compose.prod.yml ps
