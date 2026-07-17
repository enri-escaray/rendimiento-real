"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { calcularErosion, formatearPesos } from "@/lib/calculations/erosion";
import type { SnapshotDatos, Fuente } from "@/lib/apis/types";

const GANANCIA = "#4FD1A5";
const PERDIDA = "#E5533D";
const NEUTRO = "#5C6B73";

const FUENTE_LABEL: Record<Fuente, string> = {
  bcra: "BCRA",
  argentinadatos: "ArgentinaDatos",
};

interface Props {
  /** Valores iniciales reales tomados del snapshot cacheado (server-side). */
  datos: SnapshotDatos;
}

interface SimGuardada {
  id: number;
  monto: number;
  tasaAnual: number;
  inflacionAnual: number;
  meses: number;
  guardadaEn: string;
}

const STORAGE_KEY = "rendimientoreal:simulaciones";

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Formatea un porcentaje al estilo es-AR (coma decimal), hasta 2 decimales. */
function fmtPorcentaje(n: number): string {
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(n);
}

export function Calculadora({ datos }: Props) {
  const [monto, setMonto] = useState(1_000_000);
  const [meses, setMeses] = useState(12);
  const [tasaAnual, setTasaAnual] = useState(datos.plazoFijoTNA.valor);
  const [inflacionAnual, setInflacionAnual] = useState(datos.inflacionInteranual.valor);

  // Valores "reales" de referencia (autocompletados desde las fuentes). Se
  // actualizan solos vía /api/datos; el usuario puede pisarlos.
  const [realTNA, setRealTNA] = useState(datos.plazoFijoTNA.valor);
  const [realInfl, setRealInfl] = useState(datos.inflacionInteranual.valor);
  const [fuenteTNA, setFuenteTNA] = useState<Fuente>(datos.plazoFijoTNA.fuente);
  const [fuenteInfl, setFuenteInfl] = useState<Fuente>(datos.inflacionInteranual.fuente);

  // Si el usuario ya tocó el campo, no lo pisamos con el dato que llega de la API.
  const editoTNA = useRef(false);
  const editoInfl = useRef(false);

  const [sims, setSims] = useState<SimGuardada[]>([]);

  // Carga de simulaciones guardadas localmente.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSims(JSON.parse(raw) as SimGuardada[]);
    } catch {
      /* localStorage no disponible o corrupto: se ignora */
    }
  }, []);

  // Auto-actualización: al montar, refresca los datos reales desde el snapshot
  // (que el cron mantiene al día) sin recargar la página. Si el usuario no editó
  // el campo, también actualiza el valor visible.
  useEffect(() => {
    let cancelado = false;
    fetch("/api/datos")
      .then((r) => r.json())
      .then((s: SnapshotDatos) => {
        if (cancelado) return;
        setRealTNA(s.plazoFijoTNA.valor);
        setRealInfl(s.inflacionInteranual.valor);
        setFuenteTNA(s.plazoFijoTNA.fuente);
        setFuenteInfl(s.inflacionInteranual.fuente);
        if (!editoTNA.current) setTasaAnual(s.plazoFijoTNA.valor);
        if (!editoInfl.current) setInflacionAnual(s.inflacionInteranual.valor);
      })
      .catch(() => {
        /* si falla, se conservan los valores del server-render */
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const resultado = useMemo(
    () => calcularErosion({ monto, tasaAnual, inflacionAnual, meses }),
    [monto, tasaAnual, inflacionAnual, meses]
  );
  const { final, diferenciaReal, porcentajeReal, pierde, puntos } = resultado;
  const acento = pierde ? PERDIDA : GANANCIA;

  function persistir(next: SimGuardada[]) {
    setSims(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* sin persistencia si el navegador la bloquea */
    }
  }

  function guardarSimulacion() {
    const nueva: SimGuardada = {
      id: Date.now(),
      monto,
      tasaAnual,
      inflacionAnual,
      meses,
      guardadaEn: new Date().toISOString(),
    };
    persistir([nueva, ...sims].slice(0, 10));
  }

  function cargarSimulacion(s: SimGuardada) {
    editoTNA.current = true;
    editoInfl.current = true;
    setMonto(s.monto);
    setTasaAnual(s.tasaAnual);
    setInflacionAnual(s.inflacionAnual);
    setMeses(s.meses);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-6 rounded-2xl border border-borde bg-superficie p-6 sm:grid-cols-2 sm:p-7">
        <Campo
          label="Monto inicial"
          value={monto}
          onChange={setMonto}
          min={10_000}
          max={10_000_000}
          step={10_000}
          formato="moneda"
        />

        <Campo
          label="Plazo"
          value={meses}
          onChange={setMeses}
          min={1}
          max={24}
          step={1}
          formato="meses"
        />

        <Campo
          label="Tasa nominal anual (TNA)"
          value={tasaAnual}
          onChange={(v) => {
            editoTNA.current = true;
            setTasaAnual(v);
          }}
          min={0}
          max={120}
          step={0.1}
          formato="porcentaje"
          referencia={{
            valorReal: realTNA,
            fuente: fuenteTNA,
            onRestaurar: () => {
              editoTNA.current = false;
              setTasaAnual(realTNA);
            },
          }}
        />

        <Campo
          label="Inflación anual estimada"
          value={inflacionAnual}
          onChange={(v) => {
            editoInfl.current = true;
            setInflacionAnual(v);
          }}
          min={0}
          max={200}
          step={0.1}
          formato="porcentaje"
          referencia={{
            valorReal: realInfl,
            fuente: fuenteInfl,
            etiquetaReal: "interanual",
            onRestaurar: () => {
              editoInfl.current = false;
              setInflacionAnual(realInfl);
            },
          }}
        />
      </div>

      {/* Origen de los valores iniciales, justo debajo de los inputs. */}
      <p className="-mt-2 text-[12px] leading-relaxed text-texto-ter">
        Valores iniciales: plazo fijo TNA {fmtPorcentaje(datos.plazoFijoTNA.valor)}% (
        {FUENTE_LABEL[datos.plazoFijoTNA.fuente]}) · inflación interanual{" "}
        {fmtPorcentaje(datos.inflacionInteranual.valor)}% (
        {FUENTE_LABEL[datos.inflacionInteranual.fuente]}) · dólar oficial{" "}
        {formatearPesos(datos.dolarMinorista.valor)}. Podés editarlos tipeando el valor
        (con coma para decimales, ej. 33,5) o con las barras. Datos actualizados por
        última vez el {formatearFecha(datos.actualizadoEn)}.
      </p>

      {/* Resultado */}
      <div
        className="rounded-2xl border p-6 pb-4 sm:p-7 sm:pb-4"
        style={{
          background: pierde
            ? "linear-gradient(180deg, #2A1714, #171F23)"
            : "linear-gradient(180deg, #12211C, #171F23)",
          borderColor: pierde ? "#4A2822" : "#1E3A30",
        }}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[13px] text-texto-sec">
              Valor real al mes {meses} (ajustado por inflación)
            </div>
            <div className="font-mono text-[28px] font-semibold text-texto sm:text-[34px]">
              {formatearPesos(final.real)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[13px] text-texto-sec">
              {pierde ? "Perdiste poder de compra" : "Ganaste poder de compra"}
            </div>
            <div className="font-mono text-[19px] font-semibold sm:text-[22px]" style={{ color: acento }}>
              {pierde ? "" : "+"}
              {porcentajeReal.toFixed(1)}% ({formatearPesos(diferenciaReal)})
            </div>
          </div>
        </div>

        <div className="mt-5 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={puntos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-nom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NEUTRO} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={NEUTRO} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad-real" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={acento} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={acento} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#232D32" vertical={false} />
              <XAxis
                dataKey="mes"
                tick={{ fill: NEUTRO, fontSize: 11 }}
                axisLine={{ stroke: "#232D32" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: NEUTRO, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "#171F23",
                  border: "1px solid #232D32",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#8B979D" }}
                formatter={(v: number, name: string) => [
                  formatearPesos(v),
                  name === "nominal" ? "Nominal" : "Real (ajustado)",
                ]}
                labelFormatter={(m) => `Mes ${m}`}
              />
              <Area type="monotone" dataKey="nominal" stroke={NEUTRO} fill="url(#grad-nom)" strokeWidth={2} />
              <Area type="monotone" dataKey="real" stroke={acento} fill="url(#grad-real)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 pb-3 text-[12px] text-texto-sec">
          <Leyenda color={NEUTRO} label="Valor nominal" />
          <Leyenda color={acento} label="Valor real (ajustado por inflación)" />
        </div>
      </div>

      {/* Guardado local de simulaciones (sin login, localStorage) */}
      <div className="flex flex-col gap-3">
        <button
          onClick={guardarSimulacion}
          className="self-start rounded-lg border border-borde bg-superficie px-4 py-2 text-[13px] font-medium text-texto transition-colors hover:bg-superficie-alta"
        >
          Guardar esta simulación
        </button>

        {sims.length > 0 && (
          <ul className="flex flex-col gap-2">
            {sims.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-borde bg-superficie px-4 py-2.5 text-[13px]"
              >
                <span className="font-mono text-texto-sec">
                  {formatearPesos(s.monto)} · {s.meses}m · TNA {fmtPorcentaje(s.tasaAnual)}% · infl{" "}
                  {fmtPorcentaje(s.inflacionAnual)}%
                </span>
                <span className="flex gap-3">
                  <button
                    onClick={() => cargarSimulacion(s)}
                    className="text-texto underline-offset-2 hover:underline"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => persistir(sims.filter((x) => x.id !== s.id))}
                    className="text-texto-ter hover:text-[var(--color-acento-perdida)]"
                  >
                    Borrar
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

type Formato = "moneda" | "meses" | "porcentaje";

interface Referencia {
  valorReal: number;
  fuente: Fuente;
  etiquetaReal?: string;
  onRestaurar: () => void;
}

/** Formatea un número para mostrarlo en el campo, según su tipo. */
function formatearCampo(n: number, formato: Formato): string {
  if (formato === "moneda") {
    return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(n);
  }
  if (formato === "meses") {
    return String(Math.round(n));
  }
  return new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(n);
}

/** Parsea el texto tipeado a número, aceptando coma o punto como decimal. */
function parsearCampo(texto: string, formato: Formato): number {
  if (formato === "porcentaje") {
    const limpio = texto.replace(",", ".").replace(/[^0-9.]/g, "");
    return parseFloat(limpio);
  }
  // moneda y meses: enteros, se ignoran separadores de miles y cualquier símbolo.
  const soloDigitos = texto.replace(/[^\d]/g, "");
  return soloDigitos === "" ? NaN : parseInt(soloDigitos, 10);
}

function Campo({
  label,
  value,
  onChange,
  min,
  max,
  step,
  formato,
  referencia,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  formato: Formato;
  referencia?: Referencia;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const [texto, setTexto] = useState(() => formatearCampo(value, formato));
  const [focado, setFocado] = useState(false);

  // Cuando el valor cambia desde afuera (barra, restaurar, auto-actualización)
  // y el campo no está en edición, se sincroniza el texto mostrado.
  useEffect(() => {
    if (!focado) setTexto(formatearCampo(value, formato));
  }, [value, focado, formato]);

  function onTextoChange(raw: string) {
    setTexto(raw);
    const n = parsearCampo(raw, formato);
    if (!Number.isNaN(n)) onChange(clamp(n));
  }

  function onBlur() {
    const n = parsearCampo(texto, formato);
    onChange(Number.isNaN(n) ? value : clamp(n));
    setFocado(false);
  }

  const prefijo = formato === "moneda" ? "$" : null;
  const sufijo = formato === "porcentaje" ? "%" : formato === "meses" ? "meses" : null;
  const editado = referencia ? value !== referencia.valorReal : false;

  return (
    <div>
      <label className="mb-1.5 block text-[13px] text-texto-sec">{label}</label>

      {/* Entrada numérica editable, prominente y cómoda para tipear en celular. */}
      <div
        className={`flex items-center gap-2 rounded-lg border bg-fondo px-3 py-2.5 transition-colors ${
          focado ? "border-texto-sec" : "border-borde"
        }`}
      >
        {prefijo && <span className="text-[15px] text-texto-ter">{prefijo}</span>}
        <input
          type="text"
          inputMode={formato === "porcentaje" ? "decimal" : "numeric"}
          value={texto}
          onChange={(e) => onTextoChange(e.target.value)}
          onFocus={() => setFocado(true)}
          onBlur={onBlur}
          aria-label={label}
          className="min-w-0 flex-1 bg-transparent font-mono text-[18px] font-medium text-texto outline-none"
        />
        {sufijo && <span className="text-[14px] text-texto-ter">{sufijo}</span>}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} (deslizador)`}
        className="mt-3"
      />

      {referencia && (
        <div className="mt-1.5 min-h-[18px] text-[12px]">
          {editado ? (
            <span className="text-texto-ter">
              Editado por vos ·{" "}
              <button
                onClick={referencia.onRestaurar}
                className="text-texto underline underline-offset-2 hover:opacity-80"
              >
                usar {formatearCampo(referencia.valorReal, formato)}% real
              </button>
            </span>
          ) : (
            <span className="text-texto-ter">
              Dato real{referencia.etiquetaReal ? ` (${referencia.etiquetaReal})` : ""} ·{" "}
              {FUENTE_LABEL[referencia.fuente]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Leyenda({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </div>
  );
}
