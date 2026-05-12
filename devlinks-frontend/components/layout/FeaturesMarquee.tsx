"use client";

import { Marquee } from "@/components/ui/marquee";

const features = [
  "Conecta tu GitHub",
  "Analytics por link",
  "QR para compartir",
  "Repositorios destacados",
  "GitHub Stats",
  "Perfil público",
  "Centraliza tus links",
  "Comparte en un click",
];

export function FeaturesMarquee() {
  return (
    <section className="relative overflow-hidden bg-black py-4">
      <Marquee pauseOnHover>
        {features.map((feature) => (
          <span
            key={feature}
            className="mx-8 text-md font-medium text-white/70"
          >
            {feature}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
