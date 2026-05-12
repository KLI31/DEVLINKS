"use client";

import { useCallback, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: "gratuito",
    question: "¿Es gratuito DevLinks?",
    answer:
      "Sí, DevLinks es completamente gratuito. Puedes crear tu perfil, agregar links ilimitados, conectar GitHub y acceder a analíticas básicas sin costo. No hay planes de pago ocultos.",
  },
  {
    id: "github",
    question: "¿Cómo conecto mi cuenta de GitHub?",
    answer:
      'Durante el registro, selecciona "Continuar con GitHub" y autoriza la conexión. También puedes vincularla desde la configuración de tu dashboard en cualquier momento. Tus estadísticas se sincronizan automáticamente.',
  },
  {
    id: "personalizar",
    question: "¿Puedo personalizar la apariencia de mi perfil?",
    answer:
      "Sí, ofrecemos múltiples themes diseñados específicamente para developers. Puedes elegir entre diferentes estilos de tarjetas, paletas de colores y tipografías que se adapten a tu marca personal.",
  },
  {
    id: "analiticas",
    question: "¿Qué tipo de analíticas puedo ver?",
    answer:
      "Puedes ver clics totales, visitantes únicos, tasas de conversión por link, ubicación geográfica de tus visitantes y las fuentes de tráfico. Todo en tiempo real y con gráficos claros.",
  },
  {
    id: "qr",
    question: "¿Puedo generar un código QR para mi perfil?",
    answer:
      "Sí, cada perfil tiene un QR code único que puedes descargar y compartir. Es perfecto para tu currículum, tarjetas de presentación o proyectos impresos.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
  reducedMotion,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  reducedMotion: boolean;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle();
      }
    },
    [onToggle],
  );

  return (
    <motion.div
      variants={reducedMotion ? undefined : itemVariants}
      className="border-b border-border"
    >
      <h3>
        <button
          type="button"
          onClick={onToggle}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-controls={`faq-answer-${item.id}`}
          id={`faq-question-${item.id}`}
          className={cn(
            "flex w-full items-center justify-between gap-4 py-5 text-left transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "min-h-[44px] cursor-pointer",
          )}
        >
          <span className="text-base font-semibold text-foreground sm:text-lg">
            {item.question}
          </span>
          <motion.span
            animate={reducedMotion ? undefined : { rotate: isOpen ? 180 : 0 }}
            transition={
              reducedMotion ? undefined : { duration: 0.25, ease: "easeOut" }
            }
            className="shrink-0"
          >
            <ChevronDown
              className={cn(
                "size-5 text-muted-foreground transition-colors",
                isOpen && "text-primary",
              )}
              aria-hidden="true"
            />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${item.id}`}
            role="region"
            aria-labelledby={`faq-question-${item.id}`}
            initial={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            animate={reducedMotion ? undefined : { height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
            }
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection() {
  const reducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState<string | null>(FAQS[0].id);

  const toggleItem = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return (
    <section
      id="faq"
      className="relative w-[min(96vw,72rem)] mx-auto py-24 sm:py-28"
    >
      <motion.div
        variants={reducedMotion ? undefined : headerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        className="mx-auto max-w-2xl text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Preguntas <span className="text-primary">frecuentes</span>
        </h2>
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">
          Todo lo que necesitas saber antes de empezar a usar DevLinks.
        </p>
      </motion.div>

      <motion.div
        variants={reducedMotion ? undefined : containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-14 mx-auto max-w-3xl"
      >
        {FAQS.map((item) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
            isOpen={openId === item.id}
            onToggle={() => toggleItem(item.id)}
            reducedMotion={!!reducedMotion}
          />
        ))}
      </motion.div>
    </section>
  );
}
