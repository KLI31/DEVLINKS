import Link from "next/link";
import { ArrowRight, Check, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INCLUDED = [
  { title: "Links ilimitados", detail: "Sin tope por perfil." },
  {
    title: "Stats de GitHub",
    detail: "Repos, stars y contribuciones en tu perfil.",
  },
  { title: "Analíticas", detail: "Clics, visitas y fuentes de tráfico." },
  { title: "Código QR", detail: "Descargable, listo para tu CV." },
  { title: "Themes", detail: "Colores, fuentes y estilo de botones." },
  { title: "Tu URL", detail: "devlinks.nova11labs.dev/u/tu-usuario" },
];

export function PricingSection() {
  return (
    <section id="precios" className="scroll-mt-24">
      <div className="reveal px-6 py-16 text-center sm:px-10">
        <p className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          Precios
          <ChevronRight className="size-4" aria-hidden />
        </p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight text-balance text-foreground sm:text-5xl">
          Crea tu perfil sin pagar nada.
        </h2>
        <p className="mx-auto mt-5 max-w-xl font-[family-name:var(--font-inter)] text-lg text-pretty text-muted-foreground">
          Un solo plan con todo incluido, para siempre.
        </p>
      </div>

      <div className="reveal px-6 pb-20 sm:px-10">
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-card md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col justify-between gap-10 border-b border-border p-8 md:border-r md:border-b-0 sm:p-10">
            <div>
              <p className="text-sm font-medium text-primary">Plan único</p>
              <p
                className="mt-3 flex items-baseline gap-2 leading-none font-extrabold tracking-tighter text-foreground tabular-nums"
                aria-label="0 dólares al mes"
              >
                <span className="text-8xl sm:text-9xl">$0</span>
                <span className="text-sm font-medium tracking-normal text-muted-foreground">
                  / mes
                </span>
              </p>
              <p className="mt-5 max-w-xs font-[family-name:var(--font-inter)] text-pretty text-muted-foreground">
                Sin tarjeta y sin periodo de prueba. Todo lo que ves aquí es tuyo
                desde el primer día.
              </p>
            </div>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-11 w-full gap-2 rounded-full px-6 font-semibold transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]",
              )}
            >
              Crea tu DevLink gratis
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <ul className="grid content-center gap-px bg-border sm:grid-cols-2">
            {INCLUDED.map(({ title, detail }) => (
              <li key={title} className="flex items-start gap-3 bg-card p-6">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="size-3" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm break-words text-muted-foreground">
                    {detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
