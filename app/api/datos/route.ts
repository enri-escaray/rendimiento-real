import { NextResponse } from "next/server";
import { leerSnapshot } from "@/lib/db/snapshot-store";

/**
 * GET /api/datos
 * Sirve el último snapshot cacheado (tasa de plazo fijo, inflación, dólar).
 * NO llama a las APIs externas: lee del almacén propio (ver CLAUDE.md §3).
 * Es el endpoint que consume la calculadora para inicializar sus valores.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await leerSnapshot();
  return NextResponse.json(snapshot, {
    headers: {
      // Cacheable en el edge/CDN un rato; el dato cambia a lo sumo una vez al día.
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
