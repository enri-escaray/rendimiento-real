import Link from "next/link";
import { Calculadora } from "@/components/Calculadora";
import { Disclaimer } from "@/components/Disclaimer";
import { Guia } from "@/components/Guia";
import { leerSnapshot } from "@/lib/db/snapshot-store";

// El snapshot puede cambiar (cron diario): render dinámico en el server, sin
// llamar a APIs externas en el camino del usuario (lee del almacén propio).
export const dynamic = "force-dynamic";

export default async function Home() {
  const datos = await leerSnapshot();

  return (
    <main className="mx-auto min-h-screen max-w-[880px] px-5 py-10 sm:py-16">
      <header className="mb-9">
        <div className="flex items-start justify-between gap-4">
          <div className="mb-2 text-[13px] uppercase tracking-[0.08em] text-texto-ter">
            Rendimiento Real · poder adquisitivo
          </div>
          <Guia />
        </div>
        <h1 className="font-display text-[clamp(28px,4vw,42px)] font-black leading-[1.1] text-texto">
          Tu ahorro frente a la inflación
        </h1>
        <p className="mt-2.5 max-w-[540px] text-[15px] text-texto-sec">
          Calculá el poder de compra real de tu dinero a lo largo del tiempo y
          compará el valor nominal contra el valor ajustado por inflación. Es
          información educativa, no una recomendación de inversión.
        </p>
      </header>

      <Calculadora datos={datos} />

      <footer className="mt-8 flex flex-col gap-3">
        <Disclaimer />
        <nav className="flex gap-4 text-[13px] text-texto-sec">
          <Link href="/terminos" className="underline-offset-2 hover:text-texto hover:underline">
            Términos de uso
          </Link>
          <Link href="/privacidad" className="underline-offset-2 hover:text-texto hover:underline">
            Política de privacidad
          </Link>
        </nav>
      </footer>
    </main>
  );
}
