# Rendimiento Real

Calculadora de poder adquisitivo real (Argentina). Muestra, de forma **educativa
e informativa**, cuánto vale realmente un ahorro en pesos después de la inflación,
comparado con el plazo fijo. **No es asesoramiento financiero** (ver `CLAUDE.md §2`).

> Nombre interno del paquete/carpeta: `erosion` (histórico del prototipo). La
> marca visible es **Rendimiento Real**.

## Stack

Next.js (App Router) + TypeScript · Tailwind CSS v4 · Recharts · Neon (Postgres,
opcional) · Vercel (hosting + cron). Ver `CLAUDE.md §5`.

## Correr en local

```bash
npm install
npm run dev        # http://localhost:3000
```

Funciona sin base de datos: usa un snapshot semilla con valores reales y se
refresca con el cron. Para persistir en Neon, copiar `.env.example` a `.env.local`
y completar `DATABASE_URL`.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` / `npm start` — build y arranque de producción
- `npm run typecheck` — chequeo de tipos (tsc)
- `npm test` — tests unitarios (Vitest) de la lógica de cálculo
- `npm run lint` — ESLint (Next)

## Estructura

```
/app                     rutas y páginas (App Router)
  /api/datos             sirve el último snapshot cacheado (lo lee la calculadora)
  /api/cron/actualizar   job diario: consulta fuentes y persiste el snapshot
/components              UI (Calculadora, Disclaimer)
/lib/apis                clientes BCRA + ArgentinaDatos, con fallback entre sí
/lib/calculations        lógica pura de cálculo (nominal vs real) — 100% testeable
/lib/db                  store del snapshot (memoria → Neon → semilla)
/docs                    CLAUDE.md-complementario: decisiones y validaciones
```

## Datos

Fuentes públicas: **BCRA** (Estadísticas Monetarias v4.0) y **ArgentinaDatos**.
La app nunca las llama en el camino del usuario: lee siempre del snapshot propio.
Detalles y validaciones en [`docs/decisiones.md`](docs/decisiones.md).
