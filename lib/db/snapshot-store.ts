/**
 * Almacén del último snapshot de datos.
 *
 * Estrategia de lectura (de más fresco a más resiliente):
 *   1. Caché en memoria del proceso (rápida, se pierde entre despliegues).
 *   2. Base de datos Neon, si hay DATABASE_URL configurada (persistente).
 *   3. Snapshot semilla estático (siempre disponible).
 *
 * La calculadora nunca llama a las APIs externas: siempre lee de acá. La
 * escritura la hace el cron (construirSnapshot → guardarSnapshot).
 *
 * Neon "duerme y se despierta solo" ante la primera consulta (cold start < 1s),
 * sin intervención humana, y el propio cron diario lo mantiene tibio
 * (ver CLAUDE.md §5). Si no hay DATABASE_URL, todo funciona igual en memoria +
 * semilla; solo se pierde la persistencia entre despliegues.
 */
import type { SnapshotDatos } from "@/lib/apis/types";
import { SNAPSHOT_SEED } from "./seed";

let cacheMemoria: SnapshotDatos | null = null;

function tieneNeon(): boolean {
  return typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0;
}

/** Cliente Neon perezoso: solo se importa/conecta si hay DATABASE_URL. */
async function sql() {
  const { neon } = await import("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL!);
}

/** Crea la tabla (una fila, JSON) si no existe. Idempotente. */
async function asegurarTabla(): Promise<void> {
  const db = await sql();
  await db`
    CREATE TABLE IF NOT EXISTS snapshot_datos (
      id INTEGER PRIMARY KEY DEFAULT 1,
      data JSONB NOT NULL,
      actualizado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT una_sola_fila CHECK (id = 1)
    )
  `;
}

async function leerDeNeon(): Promise<SnapshotDatos | null> {
  try {
    await asegurarTabla();
    const db = await sql();
    const filas = (await db`SELECT data FROM snapshot_datos WHERE id = 1`) as Array<{
      data: SnapshotDatos;
    }>;
    return filas[0]?.data ?? null;
  } catch (err) {
    console.warn(`[db] no se pudo leer snapshot de Neon: ${String(err)}`);
    return null;
  }
}

async function escribirEnNeon(snapshot: SnapshotDatos): Promise<void> {
  await asegurarTabla();
  const db = await sql();
  await db`
    INSERT INTO snapshot_datos (id, data, actualizado_en)
    VALUES (1, ${JSON.stringify(snapshot)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, actualizado_en = now()
  `;
}

/**
 * Devuelve el mejor snapshot disponible. Nunca lanza: si todo falla, cae a la
 * semilla, de modo que la UI siempre tiene datos con los que trabajar.
 */
export async function leerSnapshot(): Promise<SnapshotDatos> {
  if (cacheMemoria) return cacheMemoria;
  if (tieneNeon()) {
    const deNeon = await leerDeNeon();
    if (deNeon) {
      cacheMemoria = deNeon;
      return deNeon;
    }
  }
  return SNAPSHOT_SEED;
}

/**
 * Persiste un snapshot nuevo (lo escribe el cron). Actualiza memoria y, si hay
 * DATABASE_URL, también Neon. Si Neon falla, deja al menos la memoria y propaga
 * el error para que el cron lo registre.
 */
export async function guardarSnapshot(snapshot: SnapshotDatos): Promise<void> {
  cacheMemoria = snapshot;
  if (tieneNeon()) {
    await escribirEnNeon(snapshot);
  }
}
