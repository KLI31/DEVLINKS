"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useAuthStore } from "@/store/auth-store";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Cargando..." }: LoadingProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{
            rotate: [0, 10, 0, -10, 0],
            y: [0, -8, 0, 8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/logo.svg"
            alt="DevLinks"
            width={64}
            height={42}
            className="shrink-0"
            priority
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}