import { NextResponse } from "next/server";
import { construirSnapshot } from "@/lib/apis";
import { guardarSnapshot, leerSnapshot } from "@/lib/db/snapshot-store";

/**
 * GET /api/cron/actualizar
 * Job de actualización: consulta BCRA (con fallback a ArgentinaDatos), arma el
 * snapshot y lo persiste. Lo dispara Vercel Cron una vez al día (ver vercel.json).
 *
 * Resiliencia (CLAUDE.md §3): si la construcción del snapshot falla por completo,
 * NO se pisa el snapshot anterior; se sigue sirviendo el último dato válido y se
 * registra el error. El propio tráfico diario de este cron mantiene tibia la base
 * Neon sin necesidad de un keep-alive extra.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function autorizado(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  // Sin secreto configurado (ej. desarrollo local), se permite.
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!autorizado(req)) {
    return NextResponse.json({ ok: false, error: "no autorizado" }, { status: 401 });
  }

  try {
    const snapshot = await construirSnapshot();
    await guardarSnapshot(snapshot);
    return NextResponse.json({ ok: true, actualizadoEn: snapshot.actualizadoEn });
  } catch (err) {
    // Mantener el último snapshot válido; solo reportar el fallo.
    const previo = await leerSnapshot();
    console.error(`[cron] actualización falló, se conserva snapshot previo: ${String(err)}`);
    return NextResponse.json(
      {
        ok: false,
        error: "no se pudo actualizar desde las fuentes; se conserva el último dato válido",
        ultimoDatoValido: previo.actualizadoEn,
      },
      { status: 502 }
    );
  }
}
