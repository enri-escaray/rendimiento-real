import { describe, it, expect } from "vitest";
import {
  calcularErosion,
  tasaMensualEquivalente,
  formatearPesos,
} from "./erosion";

describe("tasaMensualEquivalente", () => {
  it("una tasa anual de 0% da tasa mensual 0", () => {
    expect(tasaMensualEquivalente(0)).toBe(0);
  });

  it("capitaliza 12 veces la mensual y recupera la anual", () => {
    const mensual = tasaMensualEquivalente(45);
    const anualReconstruida = Math.pow(1 + mensual, 12) - 1;
    expect(anualReconstruida).toBeCloseTo(0.45, 10);
  });
});

describe("calcularErosion", () => {
  it("mes 0 siempre es el monto inicial, nominal y real", () => {
    const { puntos } = calcularErosion({
      monto: 1_000_000,
      tasaAnual: 38,
      inflacionAnual: 45,
      meses: 12,
    });
    expect(puntos[0]).toEqual({ mes: 0, nominal: 1_000_000, real: 1_000_000 });
  });

  it("genera meses+1 puntos (incluye el mes 0)", () => {
    const { puntos } = calcularErosion({
      monto: 500_000,
      tasaAnual: 30,
      inflacionAnual: 30,
      meses: 6,
    });
    expect(puntos).toHaveLength(7);
  });

  it("TNA nominal igual a la inflación anual => leve GANANCIA (la TNA se capitaliza mensual)", () => {
    // Cuidado con la intuición: al usar TNA/12 como tasa mensual y capitalizar
    // 12 veces, la tasa efectiva anual supera a la TNA nominal. Por eso una TNA
    // del 40% le gana a una inflación (compuesta) del 40%.
    const r = calcularErosion({
      monto: 1_000_000,
      tasaAnual: 40,
      inflacionAnual: 40,
      meses: 12,
    });
    expect(r.pierde).toBe(false);
    expect(r.porcentajeReal).toBeGreaterThan(0);
    // Ganancia moderada: TEA ~48,2% (por capitalizar TNA/12) vs inflación 40%.
    expect(r.porcentajeReal).toBeLessThan(8);
  });

  it("con inflación claramente mayor a la tasa, pierde poder de compra", () => {
    const r = calcularErosion({
      monto: 1_000_000,
      tasaAnual: 30,
      inflacionAnual: 60,
      meses: 12,
    });
    expect(r.pierde).toBe(true);
    expect(r.final.real).toBeLessThan(1_000_000);
    expect(r.diferenciaReal).toBe(r.final.real - 1_000_000);
  });

  it("con tasa mayor a la inflación, gana poder de compra", () => {
    const r = calcularErosion({
      monto: 1_000_000,
      tasaAnual: 80,
      inflacionAnual: 20,
      meses: 12,
    });
    expect(r.pierde).toBe(false);
    expect(r.final.real).toBeGreaterThan(1_000_000);
    expect(r.porcentajeReal).toBeGreaterThan(0);
  });

  it("con inflación 0, valor real = valor nominal", () => {
    const r = calcularErosion({
      monto: 1_000_000,
      tasaAnual: 50,
      inflacionAnual: 0,
      meses: 12,
    });
    expect(r.final.real).toBe(r.final.nominal);
    expect(r.pierde).toBe(false);
  });

  it("no rompe con monto 0 (evita división por cero en porcentaje)", () => {
    const r = calcularErosion({
      monto: 0,
      tasaAnual: 50,
      inflacionAnual: 30,
      meses: 12,
    });
    expect(r.porcentajeReal).toBe(0);
    expect(r.final.real).toBe(0);
  });

  it("normaliza meses no enteros o negativos", () => {
    expect(calcularErosion({ monto: 100, tasaAnual: 10, inflacionAnual: 10, meses: 5.9 }).puntos).toHaveLength(6);
    expect(calcularErosion({ monto: 100, tasaAnual: 10, inflacionAnual: 10, meses: -3 }).puntos).toHaveLength(1);
  });
});

describe("formatearPesos", () => {
  it("formatea sin decimales con símbolo de peso", () => {
    const s = formatearPesos(1_234_567);
    expect(s).toContain("$");
    expect(s).not.toContain(",00");
    expect(s).not.toContain(".00");
  });
});
