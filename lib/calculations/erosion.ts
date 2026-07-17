/**
 * Lógica pura de cálculo de erosión inflacionaria.
 *
 * Sin dependencias de UI ni de base de datos: son funciones puras y
 * determinísticas, testeables de forma aislada y reutilizables (por ejemplo,
 * si algún día hay un backend separado o una app mobile). Ver CLAUDE.md §5.
 *
 * Todo lo que se calcula acá es descriptivo/comparativo: valor nominal vs.
 * poder de compra real ajustado por inflación. Nada de esto es una
 * recomendación de inversión (ver CLAUDE.md §2).
 */

export interface EntradaErosion {
  /** Capital inicial en pesos (ARS). */
  monto: number;
  /** Tasa Nominal Anual del instrumento, en porcentaje (ej. 38 = 38%). */
  tasaAnual: number;
  /** Inflación anual estimada, en porcentaje (ej. 45 = 45%). */
  inflacionAnual: number;
  /** Horizonte del cálculo en meses (>= 0). */
  meses: number;
}

export interface PuntoProyeccion {
  /** Mes del período (0 = momento inicial). */
  mes: number;
  /** Valor nominal acumulado (lo que muestra el resumen de cuenta). */
  nominal: number;
  /** Valor real: nominal descontado por la inflación acumulada. */
  real: number;
}

export interface ResultadoErosion {
  /** Serie mes a mes, incluye el mes 0 (= monto inicial). */
  puntos: PuntoProyeccion[];
  /** Punto final del horizonte. */
  final: PuntoProyeccion;
  /** Diferencia en pesos entre poder de compra real final y monto inicial. */
  diferenciaReal: number;
  /** Variación porcentual del poder de compra real respecto del inicial. */
  porcentajeReal: number;
  /** true si al final se perdió poder de compra (diferenciaReal < 0). */
  pierde: boolean;
}

/**
 * Convierte una tasa anual efectiva (%) a su tasa mensual equivalente
 * por capitalización compuesta.
 */
export function tasaMensualEquivalente(anualPct: number): number {
  return Math.pow(1 + anualPct / 100, 1 / 12) - 1;
}

/**
 * Calcula la proyección nominal vs. real de un capital a lo largo de `meses`.
 *
 * Criterios (deliberados, para que el número sea comparable y no engañoso):
 * - La TNA se lleva a tasa mensual lineal (TNA / 12), que es como el banco
 *   liquida un plazo fijo tradicional (interés simple mensual sobre el capital
 *   renovado). Es lo que el prototipo aprobado ya usaba.
 * - La inflación anual se lleva a mensual por capitalización compuesta, porque
 *   la inflación se acumula multiplicativamente mes a mes.
 * - El valor real es el nominal deflactado por la inflación acumulada.
 */
export function calcularErosion(entrada: EntradaErosion): ResultadoErosion {
  const { monto, tasaAnual, inflacionAnual } = entrada;
  const meses = Math.max(0, Math.floor(entrada.meses));

  const tasaMensual = tasaAnual / 100 / 12;
  const inflMensual = tasaMensualEquivalente(inflacionAnual);

  const puntos: PuntoProyeccion[] = [];
  for (let m = 0; m <= meses; m++) {
    const nominal = monto * Math.pow(1 + tasaMensual, m);
    const real = nominal / Math.pow(1 + inflMensual, m);
    puntos.push({
      mes: m,
      nominal: Math.round(nominal),
      real: Math.round(real),
    });
  }

  const final = puntos[puntos.length - 1]!;
  const diferenciaReal = final.real - monto;
  const porcentajeReal = monto === 0 ? 0 : (diferenciaReal / monto) * 100;

  return {
    puntos,
    final,
    diferenciaReal,
    porcentajeReal,
    pierde: diferenciaReal < 0,
  };
}

/** Formatea un número como pesos argentinos, sin decimales. */
export function formatearPesos(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}
