"use client";

import { useEffect, useState } from "react";

/**
 * Botón "Guía" + panel modal que explica, en lenguaje simple, cómo funciona la
 * herramienta. Tono neutro/educativo (CLAUDE.md §2): describe, no recomienda.
 */
export function Guia() {
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    if (!abierta) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierta(false);
    };
    document.addEventListener("keydown", onKey);
    // Evita el scroll del fondo mientras el modal está abierto.
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [abierta]);

  return (
    <>
      <button
        onClick={() => setAbierta(true)}
        className="inline-flex items-center rounded-lg border border-borde bg-superficie px-3 py-1.5 text-[13px] font-medium text-texto transition-colors hover:bg-superficie-alta"
        aria-haspopup="dialog"
      >
        Guía
      </button>

      {abierta && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Guía de uso"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setAbierta(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-borde bg-superficie p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-[22px] font-semibold text-texto">
                Cómo usar esta herramienta
              </h2>
              <button
                onClick={() => setAbierta(false)}
                aria-label="Cerrar guía"
                className="rounded-md px-2 py-0.5 text-[18px] text-texto-sec hover:text-texto"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-4 text-[14px] leading-relaxed text-texto-sec">
              <p>
                Sirve para ver, de forma comparativa, cuánto vale realmente tu ahorro
                en pesos después de la inflación. Vos ponés los valores y la
                herramienta calcula: <strong className="text-texto">no te dice qué
                hacer con tu plata</strong>.
              </p>

              <Item titulo="Monto inicial y plazo">
                El capital con el que arrancás y por cuántos meses lo proyectás.
              </Item>

              <Item titulo="Tasa nominal anual (TNA)">
                La tasa del instrumento (por ejemplo, un plazo fijo). Viene
                autocompletada con el promedio real de plazo fijo de fuentes públicas,
                pero podés editarla si tenés otra tasa. Cuando la cambiás, aparece un
                aviso de que el valor fue editado por vos.
              </Item>

              <Item titulo="Inflación anual estimada">
                Es una <strong className="text-texto">estimación editable</strong>, no
                un dato cierto del futuro. Se autocompleta con la inflación interanual
                más reciente publicada, y podés ajustarla según lo que vos esperes.
              </Item>

              <Item titulo="Valor nominal vs. valor real">
                El <strong className="text-texto">valor nominal</strong> es el número
                que verías en la cuenta (capital más intereses). El{" "}
                <strong className="text-texto">valor real</strong> es ese mismo dinero
                pero medido en poder de compra, descontada la inflación. Si el real
                queda por debajo de tu monto inicial, perdiste poder de compra aunque
                el número nominal haya subido.
              </Item>

              <Item titulo="Los datos">
                Provienen de fuentes públicas (BCRA e INDEC vía ArgentinaDatos) y
                pueden tener demora. La fecha de última actualización se muestra al pie.
              </Item>

              <p className="rounded-lg border border-borde bg-fondo/50 px-3 py-2 text-[13px]">
                Esta herramienta es educativa e informativa. No constituye
                asesoramiento financiero ni recomendación de inversión.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Item({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-0.5 font-medium text-texto">{titulo}</div>
      <p>{children}</p>
    </div>
  );
}
