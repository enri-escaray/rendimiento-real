/**
 * Disclaimer legal obligatorio, visible (no escondido en el footer).
 * Texto y tono según CLAUDE.md §2: educativo/informativo, sin verbos de
 * decisión ni recomendación de inversión.
 */
export function Disclaimer() {
  return (
    <p
      role="note"
      className="rounded-xl border border-borde bg-superficie/60 px-4 py-3 text-[13px] leading-relaxed text-texto-sec"
    >
      Esta herramienta es <strong className="font-semibold text-texto">educativa e informativa</strong>.
      No constituye asesoramiento financiero ni recomendación de inversión. Los datos provienen de
      fuentes públicas (BCRA, INDEC vía ArgentinaDatos) y pueden tener demora.
    </p>
  );
}
