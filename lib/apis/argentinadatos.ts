/**
 * Cliente de ArgentinaDatos (agregador open source, gratuito, sin API key).
 * Se usa como fallback del BCRA y como fuente primaria para datos que el BCRA
 * no expone limpios, sobre todo la TNA de plazo fijo para individuos.
 * Formas verificadas contra la API el 2026-07-17.
 */
import { ARGENTINADATOS_BASE } from "./config";
import { fetchJson } from "./http";
import type { DatoConFuente } from "./types";

interface PuntoInflacion {
  fecha: string; // YYYY-MM-DD
  valor: number; // % mensual, ej. 1.9
}

interface EntidadPlazoFijo {
  entidad: string;
  tnaClientes: number; // en DECIMAL, ej. 0.19 = 19% TNA
  tnaNoClientes: number;
}

interface CotizacionDolar {
  casa: string; // "oficial" | "blue" | "mep" | ...
  compra: number;
  venta: number;
  fecha: string;
}

/** Serie mensual de inflación, ordenada de más vieja a más nueva. */
async function serieInflacion(): Promise<PuntoInflacion[]> {
  const url = `${ARGENTINADATOS_BASE}/finanzas/indices/inflacion`;
  const serie = await fetchJson<PuntoInflacion[]>(url);
  if (!Array.isArray(serie) || serie.length === 0) {
    throw new Error("ArgentinaDatos: serie de inflación vacía");
  }
  return serie;
}

export async function inflacionMensualAD(): Promise<DatoConFuente> {
  const serie = await serieInflacion();
  const ultimo = serie[serie.length - 1]!;
  return { valor: ultimo.valor, fecha: ultimo.fecha, fuente: "argentinadatos" };
}

/**
 * Inflación interanual estimada componiendo los últimos 12 valores mensuales.
 * Evita depender de un endpoint dedicado adicional y es coherente con la serie
 * mensual que ya se consume.
 */
export async function inflacionInteranualAD(): Promise<DatoConFuente> {
  const serie = await serieInflacion();
  const ultimos12 = serie.slice(-12);
  if (ultimos12.length < 12) {
    throw new Error("ArgentinaDatos: menos de 12 meses para interanual");
  }
  const factor = ultimos12.reduce((acc, p) => acc * (1 + p.valor / 100), 1);
  const interanual = (factor - 1) * 100;
  return {
    valor: Number(interanual.toFixed(1)),
    fecha: ultimos12[ultimos12.length - 1]!.fecha,
    fuente: "argentinadatos",
  };
}

/**
 * TNA promedio de plazo fijo para clientes (individuos), en porcentaje.
 * Promedia las entidades con tnaClientes > 0 y convierte de decimal a %.
 */
export async function plazoFijoTNAAD(): Promise<DatoConFuente> {
  const url = `${ARGENTINADATOS_BASE}/finanzas/tasas/plazoFijo`;
  const entidades = await fetchJson<EntidadPlazoFijo[]>(url);
  const validas = entidades.filter(
    (e) => typeof e.tnaClientes === "number" && e.tnaClientes > 0
  );
  if (validas.length === 0) {
    throw new Error("ArgentinaDatos: sin tasas de plazo fijo válidas");
  }
  const promedioDecimal =
    validas.reduce((acc, e) => acc + e.tnaClientes, 0) / validas.length;
  return {
    valor: Number((promedioDecimal * 100).toFixed(2)),
    fecha: new Date().toISOString().slice(0, 10),
    fuente: "argentinadatos",
  };
}

/**
 * Dólar minorista: promedio compra/venta de la casa "oficial".
 * OJO: el endpoint /cotizaciones/dolares/oficial devuelve la serie histórica
 * completa ordenada de más vieja a más nueva, así que la cotización vigente es
 * el ÚLTIMO elemento (no el primero).
 */
export async function dolarMinoristaAD(): Promise<DatoConFuente> {
  const url = `${ARGENTINADATOS_BASE}/cotizaciones/dolares/oficial`;
  const serie = await fetchJson<CotizacionDolar[]>(url);
  const oficial = serie[serie.length - 1];
  if (!oficial || typeof oficial.venta !== "number") {
    throw new Error("ArgentinaDatos: sin cotización de dólar oficial");
  }
  return {
    valor: Number(((oficial.compra + oficial.venta) / 2).toFixed(2)),
    fecha: oficial.fecha,
    fuente: "argentinadatos",
  };
}
