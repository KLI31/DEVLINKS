"use client";

import { useEffect } from "react";

// Marca cada `.reveal` como visible al entrar al viewport (funciona en todos los navegadores).
export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    document.documentElement.classList.add("reveal-ready");
    return () => observer.disconnect();
  }, []);

  return null;
}
