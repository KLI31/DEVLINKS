"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PRESET_SWATCHES = [
  "#0D9488", "#9452FF", "#3B82F6", "#6366F1", "#06B6D4",
  "#22C55E", "#F59E0B", "#F97316", "#F43F5E", "#8B5CF6",
  "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
  "#FFFFFF", "#F8FAFC", "#E2E8F0", "#CBD5E1", "#94A3B8",
];

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const clean = hex.replace("#", "").padEnd(6, "0");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return { h, s, v };
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [localHex, setLocalHex] = useState(value.toUpperCase());

  const hsv = hexToHsv(value);
  const [hue, setHue] = useState(hsv.h);
  const [sat, setSat] = useState(hsv.s);
  const [val, setVal] = useState(hsv.v);

  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const [draggingSv, setDraggingSv] = useState(false);
  const [draggingHue, setDraggingHue] = useState(false);

  useEffect(() => {
    const newHsv = hexToHsv(value);
    setHue(newHsv.h);
    setSat(newHsv.s);
    setVal(newHsv.v);
    setLocalHex(value.toUpperCase());
  }, [value]);

  const commit = useCallback((h: number, s: number, v: number) => {
    const hex = hsvToHex(h, s, v);
    onChange(hex);
    setLocalHex(hex);
  }, [onChange]);

  const handleSvPointer = useCallback((e: React.PointerEvent) => {
    const rect = svRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setSat(x);
    setVal(1 - y);
    commit(hue, x, 1 - y);
  }, [hue, commit]);

  const handleHuePointer = useCallback((e: React.PointerEvent) => {
    const rect = hueRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const h = x * 360;
    setHue(h);
    commit(h, sat, val);
  }, [sat, val, commit]);

  useEffect(() => {
    if (!draggingSv && !draggingHue) return;
    const handleMove = (e: PointerEvent) => {
      if (draggingSv) {
        const rect = svRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        setSat(x);
        setVal(1 - y);
        commit(hue, x, 1 - y);
      }
      if (draggingHue) {
        const rect = hueRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const h = x * 360;
        setHue(h);
        commit(h, sat, val);
      }
    };
    const handleUp = () => {
      setDraggingSv(false);
      setDraggingHue(false);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [draggingSv, draggingHue, hue, sat, val, commit]);

  const currentColor = hsvToHex(hue, sat, val);

  return (
    <div className="flex items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <div
            className="relative size-9 shrink-0 cursor-pointer rounded-full border-2 border-border/60 shadow-sm transition-transform hover:scale-110"
            style={{ background: currentColor }}
            aria-label={label || "Seleccionar color"}
            role="button"
            tabIndex={0}
          >
            <span className="sr-only">{currentColor}</span>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 gap-3 p-3" side="bottom" align="start" sideOffset={6}>
          {/* Saturation/Value area */}
          <div
            ref={svRef}
            className="relative h-32 w-full cursor-crosshair rounded-lg"
            style={{
              background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${hsvToHex(hue, 1, 1)})`,
            }}
            onPointerDown={(e) => {
              setDraggingSv(true);
              handleSvPointer(e);
            }}
          >
            <div
              className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
              style={{
                left: `${sat * 100}%`,
                top: `${(1 - val) * 100}%`,
                background: currentColor,
              }}
            />
          </div>

          {/* Hue slider */}
          <div
            ref={hueRef}
            className="relative h-3 w-full cursor-pointer rounded-full"
            style={{
              background: `linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`,
            }}
            onPointerDown={(e) => {
              setDraggingHue(true);
              handleHuePointer(e);
            }}
          >
            <div
              className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
              style={{
                left: `${(hue / 360) * 100}%`,
                background: hsvToHex(hue, 1, 1),
              }}
            />
          </div>

          {/* Presets */}
          <div className="grid grid-cols-5 gap-1.5">
            {PRESET_SWATCHES.map((swatch) => (
              <button
                key={swatch}
                type="button"
                className={cn(
                  "size-7 rounded-md border transition-transform hover:scale-110",
                  currentColor.toUpperCase() === swatch.toUpperCase()
                    ? "border-foreground/60 ring-1 ring-foreground/40"
                    : "border-border/40",
                )}
                style={{ background: swatch }}
                onClick={() => {
                  onChange(swatch);
                  setLocalHex(swatch.toUpperCase());
                  const newHsv = hexToHsv(swatch);
                  setHue(newHsv.h);
                  setSat(newHsv.s);
                  setVal(newHsv.v);
                }}
                aria-label={swatch}
              />
            ))}
          </div>

          {/* Hex input */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              HEX
            </span>
            <Input
              value={localHex}
              onChange={(e) => {
                const v = e.target.value;
                setLocalHex(v.toUpperCase());
                if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
                  onChange(v.toUpperCase());
                  const newHsv = hexToHsv(v);
                  setHue(newHsv.h);
                  setSat(newHsv.s);
                  setVal(newHsv.v);
                }
              }}
              className="h-7 font-mono text-[11px] uppercase"
              maxLength={7}
            />
          </div>
        </PopoverContent>
      </Popover>

      {label && (
        <span className="text-[11px] font-medium text-foreground">{label}</span>
      )}
    </div>
  );
}
