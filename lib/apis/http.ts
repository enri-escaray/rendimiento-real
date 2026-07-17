import { FETCH_TIMEOUT_MS } from "./config";

/**
 * fetch con timeout que devuelve JSON tipado. Pensado para usarse SOLO desde
 * el cron / actualización en background, nunca en el camino del usuario.
 *
 * Nota BCRA: en algunos entornos la API del BCRA exige un manejo de TLS
 * particular. En Node moderno (>=18) el fetch nativo la resuelve sin ajustes;
 * si algún runtime concreto fallara por el certificado, ese es el punto a
 * intervenir (agente HTTPS custom), aislado acá.
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "erosion-calculadora/0.1 (educativo)",
        ...init?.headers,
      },
      // El cron decide la frescura; no queremos que Next cachee la respuesta cruda.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} en ${url}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
