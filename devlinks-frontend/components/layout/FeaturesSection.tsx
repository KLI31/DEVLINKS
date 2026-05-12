"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { BarChart3, Braces, Globe, Link2, QrCode } from "lucide-react";

type FeatureItem = {
  title: string;
  accent: string;
  accentColor: "primary" | "second";
  description: string;
  imageSrc?: string;
  icon: React.ComponentType<{ className?: string }>;
  reversed?: boolean;
};

const FEATURES: FeatureItem[] = [
  {
    title: "Conecta GitHub y luce tu perfil técnico",
    accent: "GitHub",
    accentColor: "primary",
    description:
      "Sincroniza tus repositorios, métricas y actividad para mostrar credibilidad real en una sola vista.",
    imageSrc: "/feature-1.png",
    icon: Globe,
  },
  {
    title: "Analytics que sí te ayudan a mejorar",
    accent: "Analytics",
    accentColor: "second",
    description:
      "Mide clics por enlace, rendimiento por canal y comportamiento de visitantes para optimizar conversiones.",
    imageSrc: "/feature-2.png",
    icon: BarChart3,
    reversed: true,
  },
  {
    title: "Un solo link, todas tus plataformas",
    accent: "Un solo link",
    accentColor: "primary",
    description:
      "Agrupa tu portafolio, redes, blog y contacto en una página rápida, ordenada y fácil de compartir.",
    imageSrc: "/feature-3.png",
    icon: Link2,
  },
  {
    title: "Comparte en segundos con QR y enlace corto",
    accent: "QR",
    accentColor: "second",
    description:
      "Genera y publica tu perfil por QR en eventos, CV o redes para que te encuentren al instante.",
    icon: QrCode,
    imageSrc: "/feature-5.png",
    reversed: true,
  },
  {
    title: "Crea tu perfil automáticamente con JSON",
    accent: "JSON",
    accentColor: "primary",
    description:
      "Importa tu configuración en formato JSON para construir tu perfil en segundos y mantenerlo versionado.",
    imageSrc: "/feature-6.png",
    icon: Braces,
  },
];

function FeatureVisual({
  label,
  imageSrc,
}: {
  label: string;
  imageSrc?: string;
}) {
  const hasImage = Boolean(imageSrc);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="relative overflow-hidden rounded-3xl border border-border/70 bg-linear-to-br from-muted/70 via-muted/40 to-background p-5 shadow-sm sm:p-6"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-second/15 blur-2xl"
        aria-hidden
      />

      {hasImage ? (
        <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-background/80">
          <Image
            src={imageSrc!}
            alt={`Preview visual de ${label}`}
            width={1200}
            height={750}
            className="h-auto w-full object-cover"
            priority={false}
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-background/80 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">
            {label}
          </p>
        </div>
      )}
    </motion.div>
  );
}

const FeaturesSection = () => {
  return (
    <section className="mx-auto w-[min(96vw,72rem)] py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Features <span className="text-second">esenciales</span> para crecer
          <span className="text-primary"> tu perfil</span>
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          Cada bloque está organizado como en tu referencia: texto en un lado e
          idea de imagen en el otro, alternando por fila.
        </p>
      </div>

      <div className="mt-16">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="grid items-center gap-8 border-t border-border/60 py-12 first:border-t-0 first:pt-0 sm:grid-cols-2 sm:gap-10 sm:py-16 md:gap-12"
          >
            {feature.reversed ? (
              <>
                <div>
                  <FeatureVisual
                    label={feature.title}
                    imageSrc={feature.imageSrc}
                  />
                </div>
                <div className="rounded-2xl p-2 sm:p-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="mb-4 inline-flex items-center rounded-xl border border-border bg-background/80 px-4 py-3"
                  >
                    <feature.icon className="size-5 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {feature.title.split(feature.accent)[0]}
                    <span
                      className={
                        feature.accentColor === "primary"
                          ? "text-primary"
                          : "text-second"
                      }
                    >
                      {feature.accent}
                    </span>
                    {feature.title.split(feature.accent)[1]}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {feature.description}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-2xl p-2 sm:p-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="mb-4 inline-flex items-center rounded-xl border border-border bg-background/80 px-4 py-3"
                  >
                    <feature.icon className="size-5 text-primary" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                    {feature.title.split(feature.accent)[0]}
                    <span
                      className={
                        feature.accentColor === "primary"
                          ? "text-primary"
                          : "text-second"
                      }
                    >
                      {feature.accent}
                    </span>
                    {feature.title.split(feature.accent)[1]}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {feature.description}
                  </p>
                </div>
                <div>
                  <FeatureVisual
                    label={feature.title}
                    imageSrc={feature.imageSrc}
                  />
                </div>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
