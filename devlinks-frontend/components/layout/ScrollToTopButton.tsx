"use client";

import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useScrollTransparent } from "@/hooks/use-scroll-transparent";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ScrollToTopButton() {
  const isVisible = useScrollTransparent(320);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.92 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="fixed right-4 bottom-6 z-50 sm:right-6"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{
              duration: 1.9,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.25,
            }}
          >
            <Button
              type="button"
              onClick={handleScrollToTop}
              size="icon"
              className={cn(
                "group h-11 w-11 rounded-full border border-border/70",
                "bg-background/60 text-foreground shadow-hover backdrop-blur-xl",
                "supports-backdrop-filter:bg-background/45",
                "transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105 hover:text-white",
              )}
              aria-label="Volver al inicio"
            >
              <ArrowUp className="size-5 transition-colors duration-200 " />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
