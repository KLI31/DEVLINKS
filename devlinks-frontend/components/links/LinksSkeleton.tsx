"use client";

import { motion } from "motion/react";

export function LinksSkeleton() {
  return (
    <div className="flex flex-1 gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="size-14 animate-pulse rounded-full bg-muted" />
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-32 animate-pulse rounded-md bg-muted" />
            <div className="h-3.5 w-48 animate-pulse rounded-md bg-muted" />
          </div>
        </div>

        <div className="h-12 w-full animate-pulse rounded-full bg-muted" />

        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card p-4"
            >
              <div className="mt-1 h-5 w-5 animate-pulse rounded-sm bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-56 animate-pulse rounded-md bg-muted" />
                <div className="mt-1 h-4 w-4 animate-pulse rounded-sm bg-muted" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="h-5 w-10 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-6 animate-pulse rounded-md bg-muted" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="hidden w-[380px] shrink-0 flex-col gap-4 lg:flex">
        <div className="h-[420px] animate-pulse rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)]" />
      </div>
    </div>
  );
}
