/**
 * Agregador de fuentes: arma el SnapshotDatos aplicando la estrategia de
 * resiliencia de CLAUDE.md §3 — intenta la fuente primaria y cae a la
 * secundaria si falla. Se ejecuta SOLO desde el cron / actualización en
 * background, nunca en el camino del usuario.
 */
import {
  inflacionMensualBCRA,
  inflacionInteranualBCRA,
  dolarMinoristaBCRA,
  badlarPrivadosBCRA,
} from "./bcra";
import {
  inflacionMensualAD,
  inflacionInteranualAD,
  plazoFijoTNAAD,
  dolarMinoristaAD,
} from "./argentinadatos";
import type { DatoConFuente, SnapshotDatos } from "./types";

export type { DatoConFuente, SnapshotDatos, Fuente } from "./types";

/**
 * Intenta cada obtención en orden y devuelve la primera que tenga éxito.
 * Registra (log) los fallos para diagnóstico del cron, sin romper.
 */
async function conFallback(
  etiqueta: string,
  intentos: Array<() => Promise<DatoConFuente>>
): Promise<DatoConFuente> {
  let ultimoError: unknown;
  for (const intento of intentos) {
    try {
      return await intento();
    } catch (err) {
      ultimoError = err;
      console.warn(`[apis] ${etiqueta}: intento falló → ${String(err)}`);
    }
  }
  throw new Error(
    `[apis] ${etiqueta}: todas las fuentes fallaron (${String(ultimoError)})`
  );
}

/**
 * Construye el snapshot completo. Cada dato se resuelve de forma independiente,
 * así que si una sola fuente puntual falla, el resto del snapshot igual se arma.
 * Si un dato no se puede obtener de ninguna fuente, se propaga el error y el
 * cron mantiene el snapshot cacheado anterior (ver route del cron).
 */
export async function construirSnapshot(): Promise<SnapshotDatos> {
  const [inflacionMensual, inflacionInteranual, plazoFijoTNA, dolarMinorista] =
    await Promise.all([
      conFallback("inflacionMensual", [
        inflacionMensualBCRA,
        inflacionMensualAD,
      ]),
      conFallback("inflacionInteranual", [
        inflacionInteranualBCRA,
        inflacionInteranualAD,
      ]),
      // Plazo fijo minorista: ArgentinaDatos es la fuente preferida; BADLAR del
      // BCRA queda como respaldo grueso.
      conFallback("plazoFijoTNA", [plazoFijoTNAAD, badlarPrivadosBCRA]),
      conFallback("dolarMinorista", [dolarMinoristaBCRA, dolarMinoristaAD]),
    ]);

  return {
    inflacionMensual,
    inflacionInteranual,
    plazoFijoTNA,
    dolarMinorista,
    actualizadoEn: new Date().toISOString(),
  };
}
