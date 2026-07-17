import type { Metadata } from "next";
import { LegalLayout } from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Política de privacidad — Rendimiento Real",
  description:
    "Política de privacidad de Rendimiento Real. En esta etapa no se recolectan datos personales: las simulaciones se guardan solo en tu navegador.",
};

export default function PrivacidadPage() {
  return (
    <LegalLayout titulo="Política de privacidad" actualizado="17 de julio de 2026">
      <p>
        Esta política explica cómo se tratan los datos al usar Rendimiento Real, en
        línea con la <strong>Ley 25.326 de Protección de Datos Personales</strong> de
        Argentina.
      </p>

      <h2>1. No recolectamos datos personales</h2>
      <p>
        En esta etapa, Rendimiento Real <strong>no te pide crear una cuenta ni
        ingresar datos personales</strong> (no pedimos nombre, email, DNI, CBU ni
        ningún dato sensible). Podés usar la calculadora sin identificarte.
      </p>

      <h2>2. Qué se guarda y dónde</h2>
      <p>
        Las simulaciones que decidís guardar se almacenan{" "}
        <strong>únicamente en tu propio navegador</strong> (tecnología{" "}
        <code>localStorage</code>). Esa información <strong>no viaja a ningún
        servidor</strong> nuestro ni de terceros: queda en tu dispositivo y podés
        borrarla cuando quieras desde la misma herramienta o limpiando los datos del
        navegador.
      </p>

      <h2>3. Datos técnicos</h2>
      <p>
        No usamos cookies de seguimiento ni publicidad. El proveedor de hosting puede
        registrar datos técnicos mínimos (como dirección IP o tipo de navegador) por
        razones de seguridad y funcionamiento, de forma agregada y sin que los
        usemos para identificarte.
      </p>

      <h2>4. No compartimos datos con terceros</h2>
      <p>
        Como no recolectamos datos personales, no hay datos personales que compartir,
        vender ni ceder a terceros.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Tenés derecho a acceder, rectificar, actualizar y suprimir tus datos
        personales. Dado que no almacenamos datos personales en nuestros sistemas,
        podés ejercer el control sobre la información guardada localmente borrándola
        desde tu navegador. La Agencia de Acceso a la Información Pública, órgano de
        control de la Ley 25.326, tiene la atribución de atender denuncias respecto
        del incumplimiento de la normativa de protección de datos personales.
      </p>

      <h2>6. Cambios futuros</h2>
      <p>
        Si en el futuro se agregan cuentas de usuario o historial en servidor, esta
        política se actualizará <strong>antes</strong> de recolectar cualquier dato
        personal, detallando qué se guarda, con qué finalidad y por cuánto tiempo, y
        se pedirá tu consentimiento.
      </p>

      <h2>7. Contacto</h2>
      <p>
        Por consultas sobre privacidad escribí a{" "}
        <a href="mailto:orlesca0@gmail.com">orlesca0@gmail.com</a>. Responsable del
        tratamiento: el titular del proyecto, contactable en esa dirección.
      </p>
    </LegalLayout>
  );
}
