# DevLink — Project Rules

> Estas reglas son vinculantes en cada sesión de desarrollo.
> Violar una regla requiere justificación explícita antes de proceder.

---

## Principios de diseño

### KISS — Keep It Simple
Cada solución debe ser tan simple como el problema lo permita, pero no más.
Antes de agregar una capa de abstracción, pregunta: ¿el código es más difícil de entender sin ella?
Si la respuesta es no, no la agregues.

### DRY — Don't Repeat Yourself
La duplicación de lógica es deuda. La duplicación de estructura a veces es claridad.
- Lógica de negocio idéntica → extraer a función/servicio/hook
- Dos componentes con JSX similar → evaluar si la diferencia justifica mantenerlos separados
- Nunca copiar y pegar código entre módulos; si se necesita en dos lugares, pertenece a `lib/` o `common/`

### YAGNI — You Aren't Gonna Need It
No implementar funcionalidad que no está en el scope actual.
- Sin flags de feature para casos hipotéticos
- Sin parámetros opcionales "por si acaso"
- Sin abstracciones para una sola implementación concreta

### SOLID aplicado al stack

| Principio | Aplicación concreta en DevLink |
|-----------|-------------------------------|
| **S** — Single Responsibility | Un módulo NestJS = un dominio. Un componente React = una responsabilidad de UI |
| **O** — Open/Closed | Extender comportamiento con nuevos DTOs/interceptors, no modificar los existentes |
| **L** — Liskov | Los guards deben ser intercambiables sin romper los endpoints |
| **I** — Interface Segregation | DTOs separados para create y update — nunca un DTO "universal" con todo opcional |
| **D** — Dependency Inversion | Los servicios dependen de `PrismaService`/`RedisService`, nunca de implementaciones directas |

### Occam's Razor
Cada entidad nueva (clase, hook, módulo, tipo) debe justificar su existencia.
Si el código existente puede resolver el problema con una modificación mínima, úsalo.
La pregunta es: ¿esto elimina complejidad real o solo la mueve?

---

## Reglas de código

### No repetición — DRY en la práctica

```
ANTES de escribir código nuevo:
1. Buscar si ya existe en lib/, common/, hooks/, utils.ts
2. Buscar si un módulo existente cubre el caso
3. Solo entonces escribir código nuevo
```

- `cn()` en `lib/utils.ts` — nunca concatenar clases Tailwind manualmente
- `api.ts` — nunca hacer fetch con headers de auth duplicados en componentes
- `PrismaService` — una sola instancia inyectada, nunca `new PrismaClient()`
- DTOs compartidos entre módulos van en `src/common/dto/` — no duplicar

### Código limpio — obligatorio antes de entregar

Todo código entregado debe pasar estos checks sin errores:

```bash
# Frontend
npm run lint          # ESLint — cero errores, cero warnings
npm run type-check    # tsc --noEmit — cero errores de tipos

# Backend
npm run lint          # ESLint — cero errores, cero warnings
npm run build         # tsc — cero errores de compilación
```

**Sin excepciones:** no se entrega código con `// @ts-ignore`, `// eslint-disable`, ni `any` sin justificación documentada en el mismo comentario.

### Comentarios — solo lógica completa

Comentar bloques de lógica no obvia, nunca líneas individuales.

```typescript
// MAL — ruido que no aporta
const hashed = await bcrypt.hash(password, 10); // hashea el password con bcrypt

// BIEN — explica la decisión, no la mecánica
// Rondas en 10: balance entre seguridad y latencia en un endpoint de auth de alta frecuencia.
// Subir a 12+ impacta ~200ms por login en el hardware de producción actual.
const hashed = await bcrypt.hash(password, 10);
```

Cuándo sí comentar:
- Algoritmos no triviales (cifrado, hashing, ordenamiento custom)
- Workarounds por bugs o limitaciones de librerías externas
- Reglas de negocio con restricciones implícitas (TTLs, límites, thresholds)
- Decisiones de arquitectura que el código solo no comunica

Nunca comentar:
- Lo que el nombre del identificador ya dice
- Cada línea de un bloque — si cada línea necesita explicación, refactorizar
- TODOs sin ticket o fecha — o se resuelve ahora o se registra en el backlog

### Sin optimización prematura

No optimizar hasta que el problema sea medible.
El orden es: correcto → legible → performante.
Si se agrega una optimización, el comentario del bloque debe incluir la métrica que la justifica.

### Evaluación de efectos en cascada

Antes de modificar cualquiera de estas piezas, mapear todos los consumidores:

- `PrismaService` / schema de Prisma — impacta todas las queries
- `JwtAuthGuard` / `CurrentUser()` — impacta todos los endpoints protegidos
- `auth.store.ts` — impacta todos los componentes que leen sesión
- `api.ts` fetcher — impacta todos los hooks del frontend
- `lib/utils.ts` — impacta todos los componentes que usan `cn()` o `formatDate()`
- Contratos de API (ver sección en CLAUDE.md) — impacta frontend y posibles consumidores externos

Cambios en estos archivos requieren revisar impacto completo antes de proceder.

### Prior-art first

Antes de instalar una librería nueva:
1. ¿Lo resuelve código que ya existe en el proyecto?
2. ¿Lo resuelve una API nativa de Node, del browser o del framework?
3. ¿Existe una librería ya instalada que lo cubra?
4. Solo si las tres respuestas son no → evaluar nueva dependencia

Cada dependencia nueva tiene un costo: bundle size, superficie de ataque, mantenimiento.
Documentar en el PR por qué no se resolvió con lo existente.

### Descomposición de tareas

Ante una tarea compleja, descomponerla antes de escribir código:

```
1. Identificar el cambio mínimo que resuelve el problema
2. Listar los archivos que se van a tocar
3. Mapear efectos en cascada (ver lista arriba)
4. Implementar en orden: tipos → lógica → UI
```

No empezar a escribir código sin tener claro el punto 1.

---

## Decisiones arquitectónicas como parte del código

Las decisiones no triviales se registran donde ocurren, no solo en documentación externa.

```typescript
// src/modules/github/github.service.ts

// TTL de 6h: GitHub REST API tiene rate limit de 5000 req/h por token autenticado.
// Con ~800 usuarios activos concurrentes, sin cache superaríamos el límite en minutos.
// 6h es el balance entre datos frescos y presión sobre el rate limit.
const GITHUB_CACHE_TTL_SECONDS = 6 * 60 * 60;
```

```typescript
// src/modules/auth/crypto.service.ts

// IV aleatorio por operación (no reutilizar): si se usara IV fijo, dos plaintexts
// iguales producirían el mismo ciphertext, filtrando información sobre los tokens.
const iv = crypto.randomBytes(16);
```

---

## Features del proyecto

| Feature | Módulo | Estado |
|---------|--------|--------|
| Auth con email/password | `auth` | Implementado |
| GitHub OAuth — login y conexión de cuenta | `auth`, `github` | Implementado |
| CRUD de links con reordenamiento drag-and-drop | `link` | Implementado |
| Perfil público `/u/[username]` con Server Components | `u/[username]` | Implementado |
| Stats de GitHub en perfil (repos, contribuciones, lenguajes) | `github` | En desarrollo |
| Cache de GitHub API en Redis (TTL 6h) | `github`, `redis` | En desarrollo |
| Analytics de clics por link con geo-IP | `analytics` | Pendiente |
| Dashboard de analytics (visitas, clics, top links) | `analytics` | Pendiente |
| QR code generado por perfil | `profile` | Pendiente |
| Themes personalizados (CSS variables) | `settings` | Pendiente |
| Open Graph dinámico por perfil | `u/[username]` | Pendiente |
| Export de analytics a CSV | `analytics` | Pendiente |

---

## Checklist antes de entregar cualquier cambio

- [ ] `npm run lint` pasa sin errores ni warnings
- [ ] `npm run type-check` / `npm run build` pasa sin errores
- [ ] No hay `any`, `// @ts-ignore` ni `// eslint-disable` sin justificación documentada
- [ ] No hay lógica duplicada que ya existía en otro módulo
- [ ] Los efectos en cascada del cambio fueron evaluados
- [ ] Si se tocó el schema de Prisma, existe la migración correspondiente
- [ ] Si se agregó una variable de entorno, está documentada en `CLAUDE.md`
- [ ] Si se cambió un endpoint del API contract, se coordinó con el otro lado del stack
- [ ] Los comentarios del código cubren bloques de lógica, no líneas individuales
