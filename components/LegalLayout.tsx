import Link from "next/link";

/**
 * Contenedor compartido para las páginas legales (Términos, Privacidad).
 * Mantiene la identidad visual (tokens de CLAUDE.md §8) y da estilos de lectura
 * sin depender de un plugin de tipografía.
 */
export function LegalLayout({
  titulo,
  actualizado,
  children,
}: {
  titulo: string;
  actualizado: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-[720px] px-5 py-10 sm:py-16">
      <Link
        href="/"
        className="text-[13px] text-texto-sec underline-offset-2 hover:text-texto hover:underline"
      >
        ← Volver a la calculadora
      </Link>

      <h1 className="mt-6 font-display text-[clamp(26px,4vw,36px)] font-black leading-[1.1] text-texto">
        {titulo}
      </h1>
      <p className="mt-2 text-[13px] text-texto-ter">Última actualización: {actualizado}</p>

      <div
        className="mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-texto-sec
          [&_h2]:mt-2 [&_h2]:font-display [&_h2]:text-[19px] [&_h2]:font-semibold [&_h2]:text-texto
          [&_a]:text-texto [&_a]:underline [&_a]:underline-offset-2
          [&_strong]:font-semibold [&_strong]:text-texto
          [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5"
      >
        {children}
      </div>
    </main>
  );
}
