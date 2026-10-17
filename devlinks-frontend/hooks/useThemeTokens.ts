"use client";

import { useSyncExternalStore } from "react";

export type ThemeTokens = {
  isLight: boolean;
  font: string;
  background: string;
  foreground: string;
  primary: string;
  second: string;
};

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const read = (token: string) => styles.getPropertyValue(token).trim();
  return [
    !root.classList.contains("dark"),
    `${read("--font-jetbrains-mono")}, monospace`,
    read("--background"),
    read("--foreground"),
    read("--primary"),
    read("--second"),
  ].join("|");
}

const cache = new Map<string, ThemeTokens>();

function parse(snapshot: string): ThemeTokens {
  const cached = cache.get(snapshot);
  if (cached) return cached;
  const [isLight, font, background, foreground, primary, second] =
    snapshot.split("|");
  const tokens = {
    isLight: isLight === "true",
    font,
    background,
    foreground,
    primary,
    second,
  };
  cache.set(snapshot, tokens);
  return tokens;
}

/** Colores resueltos del tema para librerías que no entienden CSS variables (canvas/WebGL). */
export function useThemeTokens(): ThemeTokens | null {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => null);
  return snapshot ? parse(snapshot) : null;
}
