import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ErosionCalculadora() {
  const [monto, setMonto] = useState(1000000);
  const [tasaAnual, setTasaAnual] = useState(38);
  const [inflacionAnual, setInflacionAnual] = useState(45);
  const [meses, setMeses] = useState(12);

  const data = useMemo(() => {
    const tasaMensual = tasaAnual / 100 / 12;
    const inflMensual = Math.pow(1 + inflacionAnual / 100, 1 / 12) - 1;
    const puntos = [];
    for (let m = 0; m <= meses; m++) {
      const nominal = monto * Math.pow(1 + tasaMensual, m);
      const real = nominal / Math.pow(1 + inflMensual, m);
      puntos.push({
        mes: m,
        nominal: Math.round(nominal),
        real: Math.round(real),
      });
    }
    return puntos;
  }, [monto, tasaAnual, inflacionAnual, meses]);

  const final = data[data.length - 1];
  const diferencia = final.real - monto;
  const porcentaje = ((final.real - monto) / monto) * 100;
  const pierde = diferencia < 0;

  const fmt = (n) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ background: "#12181B", minHeight: "100vh", padding: "40px 20px", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: #F1EDE4; cursor: pointer; margin-top: -6px;
          box-shadow: 0 0 0 3px rgba(241,237,228,0.15);
        }
        input[type=range] {
          -webkit-appearance: none;
          height: 4px; border-radius: 2px; background: #2A343A; outline: none;
        }
      `}</style>

      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ color: "#5C6B73", fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
            Calculadora de erosión inflacionaria
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', serif", fontWeight: 900, color: "#F1EDE4",
            fontSize: "clamp(28px, 4vw, 42px)", margin: 0, lineHeight: 1.1
          }}>
            ¿Tu plata rinde, o se derrite?
          </h1>
          <p style={{ color: "#8B979D", fontSize: 15, marginTop: 10, maxWidth: 520 }}>
            Esto es información educativa, no una recomendación de inversión. Compará el valor nominal contra el poder de compra real ajustado por inflación.
          </p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
          background: "#171F23", border: "1px solid #232D32", borderRadius: 16, padding: 28
        }}>
          <Campo label="Monto inicial" value={fmt(monto)}>
            <input type="range" min="10000" max="10000000" step="10000" value={monto}
              onChange={(e) => setMonto(Number(e.target.value))} style={{ width: "100%" }} />
          </Campo>

          <Campo label="Plazo" value={`${meses} meses`}>
            <input type="range" min="1" max="24" step="1" value={meses}
              onChange={(e) => setMeses(Number(e.target.value))} style={{ width: "100%" }} />
          </Campo>

          <Campo label="Tasa nominal anual (TNA)" value={`${tasaAnual}%`}>
            <input type="range" min="0" max="120" step="1" value={tasaAnual}
              onChange={(e) => setTasaAnual(Number(e.target.value))} style={{ width: "100%" }} />
          </Campo>

          <Campo label="Inflación anual estimada" value={`${inflacionAnual}%`}>
            <input type="range" min="0" max="150" step="1" value={inflacionAnual}
              onChange={(e) => setInflacionAnual(Number(e.target.value))} style={{ width: "100%" }} />
          </Campo>
        </div>

        <div style={{
          marginTop: 24, borderRadius: 16, padding: "28px 28px 12px",
          background: pierde ? "linear-gradient(180deg, #2A1714, #171F23)" : "linear-gradient(180deg, #12211C, #171F23)",
          border: `1px solid ${pierde ? "#4A2822" : "#1E3A30"}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ color: "#8B979D", fontSize: 13 }}>
                Valor real al mes {meses} (ajustado por inflación)
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                fontSize: 34, color: "#F1EDE4"
              }}>
                {fmt(final.real)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#8B979D", fontSize: 13 }}>
                {pierde ? "Perdiste poder de compra" : "Ganaste poder de compra"}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: 22,
                color: pierde ? "#E5533D" : "#4FD1A5"
              }}>
                {pierde ? "" : "+"}{porcentaje.toFixed(1)}%  ({fmt(diferencia)})
              </div>
            </div>
          </div>

          <div style={{ height: 220, marginTop: 20 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="nom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5C6B73" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#5C6B73" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="real" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={pierde ? "#E5533D" : "#4FD1A5"} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={pierde ? "#E5533D" : "#4FD1A5"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#232D32" vertical={false} />
                <XAxis dataKey="mes" tick={{ fill: "#5C6B73", fontSize: 11 }} axisLine={{ stroke: "#232D32" }} tickLine={false} />
                <YAxis tick={{ fill: "#5C6B73", fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} width={40} />
                <Tooltip
                  contentStyle={{ background: "#171F23", border: "1px solid #232D32", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#8B979D" }}
                  formatter={(v, name) => [fmt(v), name === "nominal" ? "Nominal" : "Real (ajustado)"]}
                  labelFormatter={(m) => `Mes ${m}`}
                />
                <Area type="monotone" dataKey="nominal" stroke="#5C6B73" fill="url(#nom)" strokeWidth={2} />
                <Area type="monotone" dataKey="real" stroke={pierde ? "#E5533D" : "#4FD1A5"} fill="url(#real)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#8B979D", paddingBottom: 12 }}>
            <Leyenda color="#5C6B73" label="Valor nominal" />
            <Leyenda color={pierde ? "#E5533D" : "#4FD1A5"} label="Valor real (ajustado por inflación)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, value, children }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ color: "#8B979D", fontSize: 13 }}>{label}</span>
        <span style={{ color: "#F1EDE4", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
      </div>
      {children}
    </div>
  );
}

function Leyenda({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
      {label}
    </div>
  );
}
