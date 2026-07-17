/**
 * Cliente de la API de Estadísticas Monetarias v4.0 del BCRA (fuente primaria,
 * oficial). Aislado y testeable. No se llama desde el camino del usuario.
 */
import { BCRA_BASE, BCRA_ID } from "./config";
import { fetchJson } from "./http";
import type { DatoConFuente } from "./types";

interface BcraDetalleItem {
  fecha: string;
  valor: number;
}
interface BcraResultItem {
  idVariable: number;
  detalle: BcraDetalleItem[];
}
interface BcraSerieResponse {
  status: number;
  results: BcraResultItem[];
}

/**
 * Trae el último valor publicado de una variable monetaria por idVariable.
 *
 * Forma real de v4.0 (verificada 2026-07-17):
 *   { results: [ { idVariable, detalle: [ { fecha, valor }, ... ] } ] }
 * donde `detalle` viene ordenado de más nuevo a más viejo, así que el registro
 * más reciente es detalle[0].
 */
async function ultimoValor(idVariable: number): Promise<DatoConFuente> {
  const url = `${BCRA_BASE}/estadisticas/v4.0/Monetarias/${idVariable}?limit=1`;
  const data = await fetchJson<BcraSerieResponse>(url);
  const item = data.results?.[0]?.detalle?.[0];
  if (!item || typeof item.valor !== "number") {
    throw new Error(`BCRA: sin datos para idVariable ${idVariable}`);
  }
  return { valor: item.valor, fecha: item.fecha, fuente: "bcra" };
}

export function inflacionMensualBCRA(): Promise<DatoConFuente> {
  return ultimoValor(BCRA_ID.inflacionMensual);
}

export function inflacionInteranualBCRA(): Promise<DatoConFuente> {
  return ultimoValor(BCRA_ID.inflacionInteranual);
}

export function dolarMinoristaBCRA(): Promise<DatoConFuente> {
  return ultimoValor(BCRA_ID.dolarMinorista);
}

/**
 * BADLAR de bancos privados como proxy mayorista de tasa de plazo fijo.
 * El BCRA no expone limpia la TNA de plazo fijo para individuos, así que esto
 * es solo un respaldo grueso; la fuente preferida para plazo fijo minorista es
 * ArgentinaDatos (ver aggregator).
 */
export function badlarPrivadosBCRA(): Promise<DatoConFuente> {
  return ultimoValor(BCRA_ID.badlarPrivados);
}
