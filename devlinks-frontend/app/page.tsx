import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { Brands } from "@/components/layout/Brands";
import { FeaturesMarquee } from "@/components/layout/FeaturesMarquee";
import FeaturesSection from "@/components/layout/FeaturesSection";
import { TechMarquee } from "@/components/layout/TechMarquee";
import { CtaSection } from "@/components/layout/CtaSection";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/layout/Footer";
import { FaqSection } from "@/components/layout/FaqSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://devlinks.nova11labs.dev",
  },
};

/**
 * Build JSON-LD structured data with hardcoded/validated values only.
 * No user input is ever interpolated here, preventing XSS via script injection.
 */
function buildStructuredData(): string {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Nova 11 Labs",
        url: "https://devlinks.nova11labs.dev",
        logo: "https://devlinks.nova11labs.dev/logo.svg",
        sameAs: ["https://github.com/nova11labs"],
      },
      {
        "@type": "WebSite",
        name: "DevLinks",
        url: "https://devlinks.nova11labs.dev",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://devlinks.nova11labs.dev/u/{search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://devlinks.nova11labs.dev/#webpage",
        url: "https://devlinks.nova11labs.dev",
        name: "DevLinks — Hub de links para developers",
        description:
          "Centraliza todos tus links de developer en un solo lugar. Integración nativa con GitHub, analíticas por link, QR codes y themes personalizados. Gratis para siempre.",
        isPartOf: {
          "@id": "https://devlinks.nova11labs.dev/#website",
        },
        about: {
          "@id": "https://devlinks.nova11labs.dev/#organization",
        },
        inLanguage: "es-ES",
      },
    ],
  };
  return JSON.stringify(data);
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 z-0 bg-background" aria-hidden />
      <div
        className="pointer-events-none absolute -left-32 top-16 z-0 h-72 w-72 rounded-full bg-primary/20 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 top-40 z-0 h-64 w-64 rounded-full bg-primary/40 blur-[68px]"
        aria-hidden
      />

      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 bg-[length:6rem_4rem]",
          "bg-[image:linear-gradient(to_right,color-mix(in_srgb,var(--color-border)_35%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--color-border)_35%,transparent)_1px,transparent_1px)]",
          "dark:bg-[length:100%_100%,6rem_4rem,6rem_4rem]",
          "dark:bg-[image:radial-gradient(ellipse_100%_70%_at_50%_-20%,color-mix(in_srgb,var(--color-primary)_16%,transparent)_0%,transparent_55%),linear-gradient(to_right,color-mix(in_srgb,var(--color-border)_22%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--color-border)_22%,transparent)_1px,transparent_1px)]",
        )}
        aria-hidden
      />
      <Header />
      <main className="relative z-10 flex min-h-screen flex-col">
        <Hero />
        <Brands />
        <FeaturesMarquee />
        <FeaturesSection />
        <TechMarquee />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <ScrollToTopButton />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildStructuredData() }}
      />
    </div>
  );
}
