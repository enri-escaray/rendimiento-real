# Decisiones de arquitectura y validaciones (Erosión)

Complementa a `CLAUDE.md` (que es la fuente de la visión y las reglas). Acá quedan
las decisiones y hallazgos concretos al construir la Fase 1.

## Validación de APIs (2026-07-17)

Se consultaron las fuentes reales antes de programar los parsers (CLAUDE.md §7).
Hallazgos que están reflejados en el código:

- **BCRA v4.0 `/estadisticas/v4.0/Monetarias/{id}`** devuelve la serie anidada:
  `results[0].detalle[]`, ordenada de más nueva a más vieja → el dato vigente es
  `detalle[0]`. (En el listado general `/Monetarias` los items son planos; en la
  serie por id, no.) Ver `lib/apis/bcra.ts`.
- **Mapeo de `idVariable` del BCRA** (fijado en `lib/apis/config.ts`):
  - `27` = Inflación mensual
  - `28` = Inflación interanual
  - `4`  = Tipo de cambio minorista (promedio vendedor)
  - `7`  = BADLAR bancos privados (proxy mayorista de plazo fijo)
  - El BCRA **no** expone limpia la TNA de plazo fijo para individuos.
- **ArgentinaDatos `/cotizaciones/dolares/oficial`** devuelve la serie histórica
  completa (de más vieja a más nueva) → la cotización vigente es el **último**
  elemento, no el primero. (`.find()` agarraba un valor de 2011.) Ver
  `lib/apis/argentinadatos.ts`.
- **ArgentinaDatos `/finanzas/tasas/plazoFijo`** trae `tnaClientes` en **decimal**
  (0.19 = 19%). Se promedian las entidades con tasa > 0 y se convierte a %.
- En este entorno la API del BCRA respondió por HTTPS sin ajustes de TLS. Si un
  runtime concreto fallara por el certificado, el punto a intervenir está aislado
  en `lib/apis/http.ts`.

## Estrategia de datos

- **Fuente por dato, con fallback** (`lib/apis/index.ts`):
  - inflación mensual/interanual → BCRA, fallback ArgentinaDatos.
  - plazo fijo TNA (individuos) → ArgentinaDatos, fallback BADLAR (BCRA).
  - dólar minorista → BCRA, fallback ArgentinaDatos.
- La app **nunca** llama a las APIs externas en el camino del usuario: lee el
  snapshot cacheado (`lib/db/snapshot-store.ts`). El cron
  (`/api/cron/actualizar`, diario 12:00 UTC vía `vercel.json`) es el único que
  consulta las fuentes y persiste.
- **Resiliencia:** si la actualización falla por completo, no se pisa el snapshot
  previo; se sigue sirviendo el último válido con su timestamp visible en la UI.

## Persistencia (Neon)

- `lib/db/snapshot-store.ts` funciona en 3 niveles: memoria del proceso → Neon
  (si hay `DATABASE_URL`) → snapshot semilla (`lib/db/seed.ts`, valores reales).
- **Sin `DATABASE_URL`, todo funciona igual** (memoria + semilla); solo se pierde
  la persistencia entre despliegues. Para activar Neon: crear proyecto, poner la
  connection string en `DATABASE_URL`. La tabla se crea sola (`CREATE TABLE IF
  NOT EXISTS`).

## Nota sobre la fórmula de cálculo

`lib/calculations/erosion.ts` mantiene la fórmula del prototipo aprobado: la TNA
se lleva a tasa mensual **lineal** (TNA/12) y se capitaliza mes a mes. Efecto a
tener presente: eso hace que la **tasa efectiva anual supere a la TNA nominal**
(ej. TNA 40% → TEA ~48,2%), así que una TNA igual a la inflación anual muestra
una leve ganancia, no empate. Está cubierto por tests en `erosion.test.ts`.

## Pendiente (fuera de Fase 1)

- Crear proyecto Neon y setear `DATABASE_URL` + `CRON_SECRET` en Vercel.
- Deploy a Vercel (el `vercel.json` ya define el cron diario).
- Términos de uso y política de privacidad como páginas (hoy solo está el
  disclaimer en la calculadora).
- Fase 2: cuentas, historial en DB, comparador multi-instrumento (el dólar y la
  inflación interanual ya se cachean, listos para usarse).
