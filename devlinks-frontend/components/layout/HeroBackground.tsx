"use client";

import GradientASCII from "@/components/GradientASCII";
import { useThemeTokens } from "@/hooks/useThemeTokens";

export function HeroBackground() {
  const tokens = useThemeTokens();
  if (!tokens) return null;

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      <GradientASCII
        colors={[
          tokens.background,
          tokens.primary,
          tokens.second,
          tokens.background,
        ]}
        lightMode={tokens.isLight}
        shape="horizon"
        scale={1.6}
        characters=" .:-=+*#"
        cellSize={16}
        density={0.8}
        glyphOpacity={0.9}
        gradientOpacity={0.8}
        glow={0.35}
        flicker={0.1}
        flow={0.35}
        speed={0.6}
        grain={0.04}
        clickEffect="none"
        fontFamily={tokens.font}
      />
    </div>
  );
}
