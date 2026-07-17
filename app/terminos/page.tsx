import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Términos de uso — Rendimiento Real",
  description:
    "Términos de uso de Rendimiento Real: herramienta educativa e informativa sobre poder adquisitivo real. No constituye asesoramiento financiero.",
};

export default function TerminosPage() {
  return (
    <LegalLayout titulo="Términos de uso" actualizado="17 de julio de 2026">
      <p>
        Al usar Rendimiento Real (la &quot;herramienta&quot;) aceptás estos términos.
        Leélos con atención. Si no estás de acuerdo, no la uses.
      </p>

      <h2>1. Qué es esta herramienta</h2>
      <p>
        Rendimiento Real es una herramienta{" "}
        <strong>puramente educativa e informativa</strong>{" "}
        que muestra, de forma comparativa, cómo evoluciona el valor nominal de un
        ahorro en pesos frente a su poder de compra real ajustado por inflación. Los
        cálculos se basan en los datos que vos ingresás y en información pública.
      </p>

      <h2>2. No es asesoramiento financiero</h2>
      <p>
        La herramienta <strong>no brinda asesoramiento financiero ni recomendaciones
        de inversión</strong>, ni personalizadas ni de ningún tipo. No te dice qué
        hacer con tu dinero: solo calcula y visualiza escenarios a partir de los
        números que elegís. Cualquier decisión que tomes es de tu exclusiva
        responsabilidad. Ante una decisión financiera, consultá a un profesional
        matriculado.
      </p>

      <h2>3. Sobre los datos</h2>
      <p>
        Las tasas de plazo fijo, la inflación y las cotizaciones que se muestran son{" "}
        <strong>estimaciones basadas en fuentes públicas</strong> —principalmente el
        Banco Central de la República Argentina (BCRA) y el agregador ArgentinaDatos,
        que a su vez toma datos del INDEC— y <strong>no constituyen garantía de
        resultado</strong>. Estos datos pueden tener demora, interrupciones o errores
        de la fuente original. La fecha de última actualización se muestra en la
        propia herramienta. La inflación futura es, por definición, una estimación
        editable por vos, no un dato cierto.
      </p>

      <h2>4. Limitación de responsabilidad</h2>
      <p>
        La herramienta se ofrece &quot;tal cual&quot;, sin garantías de disponibilidad,
        exactitud o adecuación a un fin particular. En la máxima medida permitida por
        la ley, no nos responsabilizamos por decisiones tomadas en base a la
        información mostrada, ni por daños derivados de su uso, de la falta de
        disponibilidad del servicio o de errores en los datos de terceros.
      </p>

      <h2>5. Uso permitido</h2>
      <p>
        Podés usar la herramienta para fines personales e informativos. No está
        permitido usarla de forma que interfiera con su funcionamiento, ni presentar
        sus resultados como asesoramiento profesional propio.
      </p>

      <h2>6. Cambios</h2>
      <p>
        Podemos modificar estos términos y la herramienta en cualquier momento. La
        versión vigente es la publicada en esta página, con su fecha de
        actualización.
      </p>

      <h2>7. Contacto</h2>
      <p>
        Por consultas escribí a{" "}
        <a href="mailto:orlesca0@gmail.com">orlesca0@gmail.com</a>.
      </p>
    </LegalLayout>
  );
}
