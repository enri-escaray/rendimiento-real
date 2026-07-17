import type { SnapshotDatos } from "@/lib/apis/types";

/**
 * Snapshot semilla con valores reales capturados el 2026-07-17 desde BCRA y
 * ArgentinaDatos. Es el último recurso: garantiza que la calculadora siempre
 * arranque con datos plausibles aunque el cron nunca haya corrido y no haya
 * base de datos configurada. El timestamp visible en la UI deja claro que
 * puede estar desactualizado (ver CLAUDE.md §3, punto 3).
 */
export const SNAPSHOT_SEED: SnapshotDatos = {
  inflacionMensual: { valor: 1.9, fecha: "2026-06-30", fuente: "bcra" },
  inflacionInteranual: { valor: 33.5, fecha: "2026-06-30", fuente: "bcra" },
  plazoFijoTNA: { valor: 19.24, fecha: "2026-07-17", fuente: "argentinadatos" },
  dolarMinorista: { valor: 1470, fecha: "2026-07-16", fuente: "argentinadatos" },
  actualizadoEn: "2026-07-17T00:00:00.000Z",
};
