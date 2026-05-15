"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CustomizeValues } from "@/hooks/useCustomize";
import { GitReposPanel } from "./GitReposPanel";

const THEME_PRESETS = [
  {
    id: "dark",
    label: "Default",
    bgColor: "#0F172A",
    accentColor: "#0D9488",
    fontFamily: "jetbrains-mono",
  },
  {
    id: "midnight",
    label: "Midnight",
    bgColor: "#1A0A2E",
    accentColor: "#9452FF",
    fontFamily: "jetbrains-mono",
  },
  {
    id: "ocean",
    label: "Ocean",
    bgColor: "#0A1628",
    accentColor: "#06B6D4",
    fontFamily: "space-grotesk",
  },
  {
    id: "rose",
    label: "Rose",
    bgColor: "#1A0010",
    accentColor: "#F43F5E",
    fontFamily: "inter",
  },
] as const;

const ACCENT_SWATCHES = [
  "#0D9488",
  "#9452FF",
  "#3B82F6",
  "#6366F1",
  "#06B6D4",
  "#22C55E",
  "#F59E0B",
  "#F97316",
  "#F43F5E",
  "#8B5CF6",
];

const BUTTON_STYLES = [
  { id: "rounded-fill", label: "Redondeado", variant: "fill", radius: "8px" },
  { id: "sharp-fill", label: "Cuadrado", variant: "fill", radius: "2px" },
  { id: "pill-fill", label: "Píldora", variant: "fill", radius: "9999px" },
  {
    id: "rounded-outline",
    label: "Redondeado",
    variant: "outline",
    radius: "8px",
  },
  { id: "sharp-outline", label: "Cuadrado", variant: "outline", radius: "2px" },
  {
    id: "pill-outline",
    label: "Píldora",
    variant: "outline",
    radius: "9999px",
  },
] as const;

const FONT_FAMILIES = [
  {
    id: "jetbrains-mono",
    label: "JetBrains Mono",
    css: "var(--font-jetbrains-mono), ui-monospace, monospace",
    tag: "mono",
  },
  {
    id: "fira-code",
    label: "Fira Code",
    css: "var(--font-fira-code), ui-monospace, monospace",
    tag: "mono",
  },
  {
    id: "mono",
    label: "Monospace",
    css: "ui-monospace, monospace",
    tag: "mono",
  },
  { id: "inter", label: "Inter", css: "var(--font-inter), sans-serif", tag: "sans" },
  {
    id: "poppins",
    label: "Poppins",
    css: "var(--font-poppins), sans-serif",
    tag: "sans",
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    css: "var(--font-space-grotesk), sans-serif",
    tag: "sans",
  },
  { id: "outfit", label: "Outfit", css: "var(--font-outfit), sans-serif", tag: "sans" },
  {
    id: "dm-sans",
    label: "DM Sans",
    css: "var(--font-dm-sans), sans-serif",
    tag: "sans",
  },
  {
    id: "playfair",
    label: "Playfair Display",
    css: "var(--font-playfair), serif",
    tag: "serif",
  },
  { id: "fraunces", label: "Fraunces", css: "var(--font-fraunces), serif", tag: "serif" },
] as const;

const FONT_TAG_LABELS: Record<string, string> = {
  mono: "Monospace",
  sans: "Sans-serif",
  serif: "Serif",
};

interface AppearancePanelProps {
  values: CustomizeValues;
  update: (patch: Partial<CustomizeValues>) => void;
  githubUsername?: string | null;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-border/40" />;
}

const TAG_TEXT: Record<string, string> = {
  mono: "#0D9488",
  sans: "#6366F1",
  serif: "#F59E0B",
};

export function AppearancePanel({
  values,
  update,
  githubUsername,
}: AppearancePanelProps) {
  const [activeTab, setActiveTab] = useState<"appearance" | "repos">(
    "appearance",
  );
  const [fontSearch, setFontSearch] = useState("");

  const filteredFonts = fontSearch.trim()
    ? FONT_FAMILIES.filter((f) =>
        f.label.toLowerCase().includes(fontSearch.toLowerCase()),
      )
    : FONT_FAMILIES;

  const groupedFonts: Record<string, (typeof FONT_FAMILIES)[number][]> = {};
  for (const font of filteredFonts) {
    if (!groupedFonts[font.tag]) groupedFonts[font.tag] = [];
    groupedFonts[font.tag].push(font);
  }

  return (
    <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col overflow-hidden">
      <div className="mb-4 shrink-0">
        <p className="text-sm font-semibold text-foreground">Personalización</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Edita el estilo y los repos de tu perfil
        </p>
      </div>

      <div className="mb-3 flex shrink-0 rounded-lg border border-border/50 bg-muted/30 p-0.5">
        {(["appearance", "repos"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-150"
            style={
              activeTab === tab
                ? {
                    background: "var(--card)",
                    color: "var(--foreground)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }
                : { color: "var(--muted-foreground)" }
            }
          >
            {tab === "appearance" ? "Apariencia" : "Repositorios"}
          </button>
        ))}
      </div>

      <div className="scroll-thin flex-1 overflow-y-auto pr-1">
        {activeTab === "appearance" ? (
          <div className="space-y-5">
            <div>
              <SectionLabel>Tema</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {THEME_PRESETS.map((preset) => {
                  const active = values.theme === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() =>
                        update({
                          theme: preset.id,
                          bgColor: preset.bgColor,
                          accentColor: preset.accentColor,
                          fontFamily: preset.fontFamily,
                        })
                      }
                      className="relative overflow-hidden rounded-xl border transition-all duration-200"
                      style={{
                        borderColor: active
                          ? preset.accentColor
                          : "rgba(255,255,255,0.08)",
                        boxShadow: active
                          ? `0 0 0 1px ${preset.accentColor}40`
                          : "none",
                      }}
                    >
                      <div
                        className="flex h-12 items-end px-2 pb-2"
                        style={{ background: preset.bgColor }}
                      >
                        <div className="w-full space-y-1">
                          <div
                            className="h-1.5 w-full rounded-full opacity-70"
                            style={{ background: preset.accentColor }}
                          />
                          <div className="h-1 w-3/4 rounded-full bg-white/15" />
                        </div>
                      </div>
                      <div
                        className="px-2 py-1.5 text-left text-[10px] font-medium"
                        style={{
                          background: preset.bgColor,
                          color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        {preset.label}
                      </div>
                      {active && (
                        <div
                          className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full"
                          style={{ background: preset.accentColor }}
                        >
                          <Check className="size-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Divider />

            <div>
              <SectionLabel>Color de fondo</SectionLabel>
              <div className="mb-3 flex rounded-lg border border-border/50 bg-muted/30 p-0.5">
                {(["flat", "gradient"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => update({ bgType: tab })}
                    className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-150"
                    style={
                      values.bgType === tab
                        ? {
                            background: "var(--card)",
                            color: "var(--foreground)",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                          }
                        : { color: "var(--muted-foreground)" }
                    }
                  >
                    {tab === "flat" ? "Plano" : "Gradiente"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={values.bgColor}
                  onChange={(e) => update({ bgColor: e.target.value })}
                  className="size-9 shrink-0 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
                />
                <Input
                  value={values.bgColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) update({ bgColor: v });
                  }}
                  className="font-mono text-xs"
                  maxLength={7}
                  placeholder="#0F172A"
                />
              </div>
            </div>

            <Divider />

            <div>
              <SectionLabel>Imagen de portada</SectionLabel>
              <Input
                value={values.coverImageUrl}
                onChange={(e) => update({ coverImageUrl: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="text-xs"
              />
              {values.coverImageUrl && (
                <div
                  className="mt-2 h-14 w-full overflow-hidden rounded-lg border border-border/60 bg-cover bg-center"
                  style={{ backgroundImage: `url(${values.coverImageUrl})` }}
                />
              )}
            </div>

            <Divider />

            <div>
              <SectionLabel>Color de acento</SectionLabel>
              <div className="mb-3 grid grid-cols-5 gap-2">
                {ACCENT_SWATCHES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => update({ accentColor: color })}
                    className="relative size-9 rounded-lg transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2"
                    style={{ background: color }}
                    title={color}
                  >
                    {values.accentColor === color && (
                      <Check className="absolute inset-0 m-auto size-4 text-white drop-shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={values.accentColor}
                  onChange={(e) => update({ accentColor: e.target.value })}
                  className="size-9 shrink-0 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
                />
                <Input
                  value={values.accentColor}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(v))
                      update({ accentColor: v });
                  }}
                  className="font-mono text-xs"
                  maxLength={7}
                  placeholder="#0D9488"
                />
              </div>
            </div>

            <Divider />

            <div>
              <SectionLabel>Tipografía</SectionLabel>
              <div className="relative mb-2.5">
                <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={fontSearch}
                  onChange={(e) => setFontSearch(e.target.value)}
                  placeholder="Buscar fuente..."
                  className="pl-7 text-xs"
                />
              </div>
              <div className="space-y-3">
                {filteredFonts.length === 0 && (
                  <p className="py-2 text-center text-[11px] text-muted-foreground">
                    Sin resultados
                  </p>
                )}
                {(["mono", "sans", "serif"] as const).map((tag) =>
                  groupedFonts[tag]?.length ? (
                    <div key={tag}>
                      <p
                        className="mb-1.5 text-[10px] font-medium"
                        style={{ color: TAG_TEXT[tag] }}
                      >
                        {FONT_TAG_LABELS[tag]}
                      </p>
                      <div className="space-y-1.5">
                        {groupedFonts[tag]?.map((font) => {
                          const active = values.fontFamily === font.id;
                          return (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => update({ fontFamily: font.id })}
                              className="flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-all duration-150"
                              style={{
                                borderColor: active
                                  ? values.accentColor
                                  : "rgba(255,255,255,0.07)",
                                background: active
                                  ? `${values.accentColor}12`
                                  : "transparent",
                              }}
                            >
                              <span
                                className="w-8 text-base font-medium text-foreground"
                                style={{ fontFamily: font.css }}
                              >
                                Ag
                              </span>
                              <span className="flex-1 text-xs text-muted-foreground">
                                {font.label}
                              </span>
                              {active && (
                                <Check
                                  className="size-3"
                                  style={{ color: values.accentColor }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </div>

            <Divider />

            <div className="pb-4">
              <SectionLabel>Estilo de botones</SectionLabel>

              {(["fill", "outline"] as const).map((variant) => (
                <div key={variant} className="mb-3">
                  <p className="mb-1.5 text-[10px] font-medium text-muted-foreground/70">
                    {variant === "fill" ? "Relleno" : "Solo borde"}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {BUTTON_STYLES.filter((s) => s.variant === variant).map(
                      (style) => {
                        const active = values.buttonStyle === style.id;
                        return (
                          <button
                            key={style.id}
                            type="button"
                            onClick={() => update({ buttonStyle: style.id })}
                            className="flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-150"
                            style={{
                              borderColor: active
                                ? values.accentColor
                                : "rgba(255,255,255,0.07)",
                              background: active
                                ? `${values.accentColor}52`
                                : "transparent",
                            }}
                          >
                            <div
                              className="h-5 w-full"
                              style={{
                                borderRadius: style.radius,
                                ...(variant === "fill"
                                  ? { background: "rgba(255,255,255,0.18)" }
                                  : {
                                      border: "1.5px solid rgba(255,255,255,0.3)",
                                      background: "transparent",
                                    }),
                              }}
                            />
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {style.label}
                            </span>
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <GitReposPanel githubUsername={githubUsername} />
        )}
      </div>
    </div>
  );
}
