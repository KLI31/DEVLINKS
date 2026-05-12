"use client";

import { motion } from "motion/react";

export function LinksSkeleton() {
  return (
    <div className="flex flex-1 gap-5">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex items-center gap-1.5 border-b border-border/50 px-6 py-2.5">
          <div className="h-3.5 w-3.5 animate-pulse rounded-sm bg-muted" />
          <div className="h-3 w-64 animate-pulse rounded-sm bg-muted" />
        </div>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-[var(--shadow-card)]"
            >
              <div className="h-5 w-5 animate-pulse rounded-sm bg-muted" />
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="h-4 w-32 animate-pulse rounded-sm bg-muted" />
                <div className="h-3 w-48 animate-pulse rounded-sm bg-muted" />
              </div>
              <div className="h-6 w-11 animate-pulse rounded-full bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
              <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="hidden w-80 shrink-0 flex-col gap-4 lg:flex">
        <div className="h-[420px] animate-pulse rounded-2xl border border-border/70 bg-card shadow-[var(--shadow-card)]" />
      </div>
    </div>
  );
}
