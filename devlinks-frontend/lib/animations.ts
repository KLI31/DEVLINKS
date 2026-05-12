import type { Transition, Variants } from "motion/react";

const tooltipTransition: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 24,
  mass: 0.8,
};

export const tooltipAnimation = {
  initial: { opacity: 0, scale: 0.92, x: -6 },
  animate: { opacity: 1, scale: 1, x: 0 },
  exit: { opacity: 0, scale: 0.92, x: -6 },
  transition: tooltipTransition,
} as const;

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};
