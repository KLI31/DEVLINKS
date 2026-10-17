"use client";

import Link from "next/link";

import PixelBlast from "@/components/PixelBlast";
import { BrandIcon } from "@/components/layout/BrandIcon";
import { ClaimForm } from "@/components/layout/Hero";
import { buttonVariants } from "@/components/ui/button";
import { useThemeTokens } from "@/hooks/useThemeTokens";
import { cn } from "@/lib/utils";

function CtaBackground() {
  const tokens = useThemeTokens();
  if (!tokens) return null;

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <PixelBlast
        variant="square"
        pixelSize={4}
        color={tokens.primary}
        accentColor={tokens.second}
        lightMode={tokens.isLight}
        patternScale={2.5}
        patternDensity={0.9}
        edgeFade={0.3}
        speed={0.4}
        glow={0.3}
        twinkle={0.2}
        hoverEffect="reveal"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_center,var(--background)_45%,transparent_85%)]" />
    </div>
  );
}

export function CtaSection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate overflow-hidden px-6 py-28 sm:px-10 sm:py-36"
    >
      <CtaBackground />

      <div className="reveal relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <h2
          id="cta-heading"
          className="text-3xl leading-tight font-bold tracking-tight text-balance text-foreground sm:text-5xl"
        >
          Tu próximo <span className="text-second">git push</span>
          <span
            className="animate-caret-blink text-second select-none"
            aria-hidden
          >
            _
          </span>{" "}
          empieza con un solo link
        </h2>

        <p className="mt-6 max-w-xl font-[family-name:var(--font-inter)] text-lg text-pretty text-muted-foreground">
          Reclama tu usuario ahora y ten tu perfil listo antes de que termine el
          build.
        </p>

        <div className="mt-10 flex w-full justify-center">
          <ClaimForm />
        </div>

        <div
          aria-hidden
          className="my-6 flex w-full max-w-xl items-center gap-3 text-xs text-muted-foreground"
        >
          <span className="h-px flex-1 bg-border" />o
          <span className="h-px flex-1 bg-border" />
        </div>

        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "min-h-11 gap-2 rounded-full bg-card/80 px-6 backdrop-blur-sm transition-[scale,background-color] duration-150 ease-out active:scale-[0.96]",
          )}
        >
          <BrandIcon name="github" className="size-4" />
          Continuar con GitHub
        </Link>

        <p className="mt-8 text-xs text-muted-foreground">
          Gratis para siempre · Sin tarjeta
        </p>
      </div>
    </section>
  );
}
