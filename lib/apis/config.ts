/**
 * Configuración de fuentes de datos públicas.
 *
 * El mapeo de idVariable del BCRA se resolvió una sola vez consultando la API
 * real (GET https://api.bcra.gob.ar/estadisticas/v4.0/Monetarias) y se fija acá
 * para no re-descubrirlo en cada request (ver CLAUDE.md §7).
 *
 * Verificado contra la API el 2026-07-17.
 */

export const BCRA_BASE = "https://api.bcra.gob.ar";
export const ARGENTINADATOS_BASE = "https://api.argentinadatos.com/v1";

/**
 * idVariable de la API de Estadísticas Monetarias v4.0 del BCRA.
 * Confirmados con datos reales:
 *   27 → "Inflación mensual."      (jun-2026 = 1.9)
 *   28 → "Inflación interanual."   (jun-2026 = 33.5)
 *    4 → "Tipo de cambio minorista (promedio vendedor)"
 *    7 → "Tasa de interés BADLAR de bancos privados" (proxy mayorista de plazo fijo)
 */
export const BCRA_ID = {
  inflacionMensual: 27,
  inflacionInteranual: 28,
  dolarMinorista: 4,
  badlarPrivados: 7,
} as const;

/** Timeout por request a fuentes externas (ms). Nunca en el camino del usuario. */
export const FETCH_TIMEOUT_MS = 12_000;

/**
 * El INDEC publica el IPC una vez al mes: no tiene sentido pedir "tiempo real"
 * para inflación. Este valor documenta cuán viejo puede estar el dato mensual
 * antes de considerarlo sospechoso (para logs/alertas del cron).
 */
export const INFLACION_MAX_DIAS_SIN_ACTUALIZAR = 45;
