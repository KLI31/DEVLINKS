# Analytics.md — Dashboard de Analíticas DevLinks

> Plan completo: backend (NestJS) + frontend (Next.js 16) para la página
> `app/(dashboard)/dashboard/analytics/page.tsx`.

---

## Contexto y datos disponibles

### Lo que ya existe en el backend

| Recurso                  | Dónde                                    | Qué aporta                                              |
| ------------------------ | ---------------------------------------- | ------------------------------------------------------- |
| `LinkAnalytic` (Prisma)  | `schema.prisma`                          | `linkId`, `visitorIp`, `userAgent`, `referrer`, `countryCode`, `clickedAt` |
| `Link.clicksCount`       | `schema.prisma`                          | Contador agregado de clics por link                     |
| `geo-ip.helper.ts`       | `src/modules/user/helpers/geo-ip.helper` | `geoip-lite` → ciudad, país, countryCode por IP         |

### Lo que falta

- **Módulo `analytics`** en el backend (controller + service + module)
- **Modelo `ProfileView`** para rastrear visitas al perfil público
- **Frontend**: recharts + mapcn + página de analytics + 6 componentes de gráficas

---

## Diseño del grid (layout de la página)

```
┌──────────┬──────────┬──────────┬──────────┐
│  Total   │  Vistas  │  Países  │   Link   │  ← Fila 1: stat cards
│  Clics   │  perfil  │alcanzados│  top CTR │
└──────────┴──────────┴──────────┴──────────┘
┌─────────────────────────┬────────────────┐
│   Clics en el tiempo    │   Referrers    │  ← Fila 2
│   AreaChart (recharts)  │   DonutChart   │
│   7 / 30 / 90 días      │   (recharts)   │
└─────────────────────────┴────────────────┘
┌─────────────────────────────────────────┐
│   Mapa mundial — clics por país         │  ← Fila 3 (full width)
│   mapcn Map + Markers + Clusters        │
└─────────────────────────────────────────┘
┌─────────────────────────┬────────────────┐
│   Progreso por link     │  Dispositivos  │  ← Fila 4
│   (progress + ranking)  │   BarChart     │
└─────────────────────────┴────────────────┘
```

Selector de rango temporal en el header de la página: **7d / 30d / 90d**.  
Todos los widgets se re-fetchen cuando cambia el rango (query param `?days=N`).

---

## Parte 1 — Backend (NestJS)

### 1.1 Nuevo modelo: `ProfileView`

Agregar al `schema.prisma` para rastrear visitas al perfil público:

```prisma
model ProfileView {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  visitorIp   String?  @map("visitor_ip")
  userAgent   String?  @map("user_agent")
  referrer    String?
  countryCode String?  @map("country_code")
  viewedAt    DateTime @default(now()) @map("viewed_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([viewedAt])
  @@map("profile_views")
}
```

Agregar la relación inversa en `User`:
```prisma
profileViews  ProfileView[]
```

Generar migración:
```bash
npx prisma migrate dev --name add_profile_views
```

### 1.2 Módulo `analytics`

Crear la siguiente estructura:

```
src/modules/analytics/
├── analytics.module.ts
├── analytics.controller.ts
└── analytics.service.ts
```

### 1.3 Endpoints del módulo analytics

Todos requieren JWT (`@UseGuards(JwtAuthGuard)`). Query param `days` → 7 | 30 | 90 (default: 30).

#### `GET /analytics/summary?days=N`

```ts
{
  totalClicks: number;       // SUM(link.clicksCount) del usuario
  profileViews: number;      // COUNT(ProfileView) en el rango
  countriesReached: number;  // COUNT DISTINCT countryCode en LinkAnalytic
  topLink: {
    id: string;
    title: string;
    clicks: number;
  } | null;
}
```

#### `GET /analytics/clicks-timeline?days=N`

Agrupa `LinkAnalytic.clickedAt` por día:

```ts
[{ date: "2025-04-01", count: 42 }, ...]
```

#### `GET /analytics/links-stats?days=N`

Por cada link del usuario, clics en el rango + porcentaje sobre el total:

```ts
[{
  id: string;
  title: string;
  url: string;
  icon: string | null;
  clicks: number;
  percentage: number;  // 0–100
}]
```

#### `GET /analytics/countries?days=N`

Agrupa por `countryCode` en `LinkAnalytic`. El servicio usa `geoip-lite` para
obtener las coordenadas del centroide del país:

```ts
[{
  countryCode: string;   // "CO"
  country: string;       // "Colombia"
  count: number;
  lat: number;
  lng: number;
}]
```

#### `GET /analytics/referrers?days=N`

```ts
[{
  referrer: string;    // dominio limpio, e.g. "twitter.com" | "direct"
  count: number;
  percentage: number;
}]
```

#### `GET /analytics/devices?days=N`

Parsea `userAgent` en `LinkAnalytic` con categorías simples:
`"Mobile"`, `"Desktop"`, `"Tablet"`, `"Bot"`.

```ts
[{ device: string; count: number }]
```

### 1.4 Registro de visitas al perfil público

En `UserController`, en el endpoint `GET /users/:username/public`,
agregar el registro fire-and-forget de la visita:

```ts
// No hace await, no bloquea la respuesta
this.analyticsService.recordProfileView(user.id, ip, userAgent, referrer);
```

---

## Parte 2 — Frontend (Next.js 16)

### 2.1 Instalación de dependencias

```bash
# Recharts (gráficas)
npm install recharts

# mapcn (mapa) — instala maplibre-gl automáticamente
npx shadcn@latest add @mapcn/map
```

Verificar que `components/ui/map.tsx` fue creado por el CLI de mapcn.

### 2.2 Tipo `AnalyticsSummary` (frontend)

Crear `types/analytics.ts`:

```ts
export interface AnalyticsSummary {
  totalClicks: number;
  profileViews: number;
  countriesReached: number;
  topLink: { id: string; title: string; clicks: number } | null;
}

export interface ClicksTimelinePoint {
  date: string;
  count: number;
}

export interface LinkStat {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  clicks: number;
  percentage: number;
}

export interface CountryStat {
  countryCode: string;
  country: string;
  count: number;
  lat: number;
  lng: number;
}

export interface ReferrerStat {
  referrer: string;
  count: number;
  percentage: number;
}

export interface DeviceStat {
  device: string;
  count: number;
}
```

### 2.3 Cliente API

Crear `lib/api/analytics.api.ts`:

```ts
// GET /analytics/summary?days=N
// GET /analytics/clicks-timeline?days=N
// GET /analytics/links-stats?days=N
// GET /analytics/countries?days=N
// GET /analytics/referrers?days=N
// GET /analytics/devices?days=N
```

Cada función recibe `days: 7 | 30 | 90` y retorna el tipo correspondiente.

### 2.4 Estructura de archivos (frontend)

```
app/(dashboard)/dashboard/analytics/
└── page.tsx                          ← Server Component, fetches en paralelo

components/analytics/
├── StatCards.tsx                     ← Fila 1: 4 tarjetas de resumen
├── ClicksAreaChart.tsx               ← Recharts AreaChart (clics en el tiempo)
├── ReferrersDonutChart.tsx           ← Recharts PieChart tipo donut
├── ClicksWorldMap.tsx                ← mapcn Map + Markers + Clusters
├── LinksProgressList.tsx             ← Lista de links con progress bars
├── DevicesBarChart.tsx               ← Recharts BarChart
└── RangeSelectorTabs.tsx             ← Tabs 7d / 30d / 90d (client component)
```

### 2.5 Página principal `analytics/page.tsx`

Server Component. Hace todos los fetches en paralelo con `Promise.all`.  
Recibe `searchParams.days` (default `"30"`).

```ts
const [summary, timeline, linksStats, countries, referrers, devices] =
  await Promise.all([
    analyticsApi.getSummary(days),
    analyticsApi.getClicksTimeline(days),
    analyticsApi.getLinksStats(days),
    analyticsApi.getCountries(days),
    analyticsApi.getReferrers(days),
    analyticsApi.getDevices(days),
  ]);
```

Renderiza el grid pasando datos como props a cada componente.  
`RangeSelectorTabs` es el único `"use client"` en esta capa — cambia el query param `?days=N` con `router.push`.

---

## Parte 3 — Especificación de cada widget

### 3.1 `StatCards` — Fila de resumen

Cuatro cards con shadcn `Card`. Cada una tiene:
- Icono lucide-react (coloreado con `accentColor` del usuario vía CSS var)
- Número grande en `font-mono`
- Label descriptivo
- Delta vs período anterior (ej. `+12%`) si el backend lo expone (post-MVP)

| Card            | Ícono          | Valor                         |
| --------------- | -------------- | ----------------------------- |
| Total clics     | `MousePointer2`| `summary.totalClicks`         |
| Vistas perfil   | `Eye`          | `summary.profileViews`        |
| Países          | `Globe`        | `summary.countriesReached`    |
| Link más activo | `TrendingUp`   | `summary.topLink?.title`      |

### 3.2 `ClicksAreaChart` — Recharts

```tsx
<AreaChart data={timeline}>
  <defs>
    <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
      <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area
    type="monotone"
    dataKey="count"
    stroke={accentColor}
    fill="url(#clicksGrad)"
    strokeWidth={2}
  />
  <XAxis dataKey="date" ... />
  <Tooltip ... />
</AreaChart>
```

- Fondo transparente (`background: "transparent"`)
- Grid lines con `stroke="var(--border)"`
- Tooltip con estilo dark consistente con el dashboard

### 3.3 `ReferrersDonutChart` — Recharts

```tsx
<PieChart>
  <Pie
    data={referrers}
    dataKey="count"
    nameKey="referrer"
    innerRadius="60%"
    outerRadius="80%"
  >
    {referrers.map((_, i) => (
      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
    ))}
  </Pie>
  <Legend />
  <Tooltip />
</PieChart>
```

`PALETTE`: usar los colores del design system (`accentColor`, secondary `#9452ff`, y tonos derivados).  
Centro del donut: número total de clics en texto `font-mono`.

### 3.4 `ClicksWorldMap` — mapcn

```tsx
"use client"

import { Map, Markers, Clusters } from "@/components/ui/map";

export function ClicksWorldMap({ countries }: { countries: CountryStat[] }) {
  const markers = countries.map(c => ({
    id: c.countryCode,
    coordinates: [c.lng, c.lat] as [number, number],
    data: c,
  }));

  return (
    <Card className="h-[380px] p-0 overflow-hidden">
      <Map center={[0, 20]} zoom={1.5}>
        <Clusters>
          <Markers
            markers={markers}
            render={(marker) => (
              <div
                className="flex items-center justify-center rounded-full font-mono text-xs font-bold text-white"
                style={{
                  width: markerSize(marker.data.count),
                  height: markerSize(marker.data.count),
                  background: accentColor,
                  opacity: 0.85,
                }}
              >
                {marker.data.count}
              </div>
            )}
          />
        </Clusters>
      </Map>
    </Card>
  );
}
```

- El tamaño del marcador escala logarítmicamente con el count
- Hover en un marcador muestra un `Popup` de mapcn con país + clics
- Tema dark automático (mapcn usa CARTO dark tiles en dark mode)

### 3.5 `LinksProgressList` — Progress por link

```tsx
{linksStats.map(link => (
  <div key={link.id} className="space-y-1">
    <div className="flex items-center justify-between font-mono text-sm">
      <span className="flex items-center gap-2">
        <LinkIcon icon={link.icon} />
        {link.title}
      </span>
      <span className="text-muted-foreground">{link.clicks} clics</span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: accentColor }}
        initial={{ width: 0 }}
        animate={{ width: `${link.percentage}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  </div>
))}
```

- Animación de entrada con `motion` al montarse
- Porcentaje mostrado en tooltip al hover de la barra
- Ordenado de mayor a menor clics
- Máximo 10 links visibles; si hay más → botón "ver todos"

### 3.6 `DevicesBarChart` — Recharts

```tsx
<BarChart data={devices} layout="vertical">
  <XAxis type="number" />
  <YAxis type="category" dataKey="device" width={70} />
  <Bar dataKey="count" fill={accentColor} radius={[0, 4, 4, 0]} />
  <Tooltip />
</BarChart>
```

Layout horizontal con categorías en el eje Y: `Mobile`, `Desktop`, `Tablet`, `Bot`.

---

## Parte 4 — Estados de carga y vacío

| Widget              | Loading                         | Sin datos                          |
| ------------------- | ------------------------------- | ---------------------------------- |
| StatCards           | Skeleton 4 cards                | `—` en lugar del número            |
| ClicksAreaChart     | Skeleton rect                   | "Sin clics en este período"        |
| ReferrersDonut      | Skeleton círculo                | "Sin referrers registrados"        |
| ClicksWorldMap      | Spinner centrado en el mapa     | Mapa vacío con texto superpuesto   |
| LinksProgressList   | Skeleton 5 filas                | "Ningún link tiene clics aún"      |
| DevicesBarChart     | Skeleton rect                   | "Sin datos de dispositivos"        |

Usar `loading.tsx` de Next.js en la carpeta de analytics para el skeleton inicial.

---

## Parte 5 — Dependencias nuevas

| Paquete        | Por qué                          | Cómo instalar                              |
| -------------- | -------------------------------- | ------------------------------------------ |
| `recharts`     | Gráficas (área, dona, barras)    | `npm install recharts`                     |
| `maplibre-gl`  | Motor del mapa (auto por mapcn)  | `npx shadcn@latest add @mapcn/map`         |
| `@mapcn/map`   | Componente de mapa               | `npx shadcn@latest add @mapcn/map`         |

**Backend** — ya tiene `geoip-lite` en `geo-ip.helper.ts`. No se agregan más deps.

---

## Parte 6 — Reglas de diseño

- Todo el texto en `font-mono` (JetBrains Mono)
- Colores de gráficas usando `accentColor` del usuario como primario
- Dark mode nativo (mapcn ajusta el mapa automáticamente)
- Sin animaciones en `prefers-reduced-motion` → pasar `isReducedMotion` como prop a todos los charts
- Recharts: `ResponsiveContainer width="100%" height="100%"` en todos los charts
- Cards del grid usan `Card` de shadcn con `p-4` y `rounded-xl`
- Gap entre cards: `gap-4` en el grid

---

## Orden de implementación sugerido

### Backend primero

1. Agregar modelo `ProfileView` al schema + `prisma migrate dev`
2. Crear `src/modules/analytics/analytics.module.ts`
3. Crear `analytics.service.ts` con los 6 métodos de consulta
4. Crear `analytics.controller.ts` con los 6 endpoints GET
5. Registrar el módulo en `app.module.ts`
6. Agregar `recordProfileView` fire-and-forget en el endpoint de perfil público
7. Probar con Postman/curl todos los endpoints

### Frontend

8. `npm install recharts`
9. `npx shadcn@latest add @mapcn/map` → verificar `components/ui/map.tsx`
10. Crear `types/analytics.ts`
11. Crear `lib/api/analytics.api.ts`
12. Crear `components/analytics/RangeSelectorTabs.tsx` (client)
13. Crear `components/analytics/StatCards.tsx`
14. Crear `components/analytics/ClicksAreaChart.tsx`
15. Crear `components/analytics/ReferrersDonutChart.tsx`
16. Crear `components/analytics/DevicesBarChart.tsx`
17. Crear `components/analytics/LinksProgressList.tsx`
18. Crear `components/analytics/ClicksWorldMap.tsx`
19. Crear `app/(dashboard)/dashboard/analytics/loading.tsx` (skeleton)
20. Actualizar `app/(dashboard)/dashboard/analytics/page.tsx` con el grid completo
21. Probar con datos reales en dev: cambiar rangos, verificar mapa, verificar recharts responsive

---

## Notas de implementación

- **`maplibre-gl` CSS**: importar `"maplibre-gl/dist/maplibre-gl.css"` en `app/layout.tsx` o en el componente del mapa (client-only). Sin este import el mapa no renderiza correctamente.
- **Recharts + SSR**: los componentes de recharts son client-only. Todos los archivos en `components/analytics/` que usen recharts o mapcn deben tener `"use client"`.
- **`ResponsiveContainer`**: envolver todos los charts en `<ResponsiveContainer width="100%" height={300}>` para que sean responsivos.
- **Coordenadas del mapa**: `geoip-lite` retorna `ll: [lat, lng]`. El backend debe incluirlas en la respuesta del endpoint `/analytics/countries`. En el frontend, mapcn espera `[lng, lat]` (orden GeoJSON) — atención al swap.
- **Privacidad**: `visitorIp` se guarda hasheada (ya en `geo-ip.helper.ts`). El frontend nunca recibe IPs, solo códigos de país y conteos.
- **Filtro de días en URL**: usar `searchParams` de Next.js en el Server Component para leer `days`. El `RangeSelectorTabs` usa `router.push` con `shallow: true` para actualizar sin full reload.
