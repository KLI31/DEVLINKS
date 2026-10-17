import type { Metadata } from "next";

import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import FeaturesSection from "@/components/layout/FeaturesSection";
import { TechMarquee } from "@/components/layout/TechMarquee";
import { CtaSection } from "@/components/layout/CtaSection";
import { Footer } from "@/components/layout/Footer";
import { FaqSection } from "@/components/layout/FaqSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { RevealObserver } from "@/components/layout/RevealObserver";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://devlinks.nova11labs.dev",
  },
};

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
        url: "https://devlinks.lramdev.com",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://devlinks.lramdev.com/u/{search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://devlinks.lramdev.com/#webpage",
        url: "https://devlinks.lramdev.com",
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
      <Header />
      <main className="relative z-10 flex min-h-screen flex-col">
        <Hero />
        <div className="mx-auto w-[min(96vw,72rem)] divide-y divide-dashed divide-border/70 border-x border-t border-dashed border-border/70 [border-left-style:solid] [border-right-style:solid]">
          <FeaturesSection />
          <TechMarquee />
          <FaqSection />
          <CtaSection />
        </div>
      </main>
      <Footer />
      <ScrollToTopButton />
      <RevealObserver />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildStructuredData() }}
      />
    </div>
  );
}
