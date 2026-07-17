/**
 * Tipos compartidos por los clientes de datos y el snapshot que se cachea
 * y se sirve al frontend.
 */

/** De dónde salió efectivamente un dato (para trazabilidad y disclaimer). */
export type Fuente = "bcra" | "argentinadatos";

export interface DatoConFuente {
  /** Valor en porcentaje anual (o el que corresponda al campo). */
  valor: number;
  /** Fecha del dato original (YYYY-MM-DD), tal como la reporta la fuente. */
  fecha: string;
  fuente: Fuente;
}

/**
 * Snapshot cacheado que consume la calculadora. La app nunca llama a las APIs
 * externas en el camino del usuario: siempre lee esto (ver CLAUDE.md §3).
 */
export interface SnapshotDatos {
  /** Inflación mensual del último período publicado (%). */
  inflacionMensual: DatoConFuente;
  /** Inflación interanual (%). Sirve como default del slider "inflación anual". */
  inflacionInteranual: DatoConFuente;
  /** TNA promedio de plazo fijo para clientes/individuos (%). */
  plazoFijoTNA: DatoConFuente;
  /** Dólar minorista de referencia (ARS por USD). */
  dolarMinorista: DatoConFuente;
  /** Momento en que se armó este snapshot (ISO 8601). */
  actualizadoEn: string;
}
