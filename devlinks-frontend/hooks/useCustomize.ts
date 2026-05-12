"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { userApi } from "@/lib/api/user.api";
import type { PlacedSticker, UpdateProfilePayload } from "@/types";
import { toast } from "sonner";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type CustomizeValues = {
  theme: string;
  bgType: string;
  bgColor: string;
  coverImageUrl: string;
  accentColor: string;
  fontFamily: string;
  buttonStyle: string;
  stickers: PlacedSticker[];
};

const DEFAULTS: CustomizeValues = {
  theme:        "dark",
  bgType:       "flat",
  bgColor:      "#0F172A",
  coverImageUrl: "",
  accentColor:  "#0D9488",
  fontFamily:   "jetbrains-mono",
  buttonStyle:  "rounded-fill",
  stickers:     [],
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const VALID_THEMES        = new Set(["dark", "light", "midnight", "ocean", "rose"]);
const VALID_BG_TYPES      = new Set(["flat", "gradient"]);
const VALID_FONTS         = new Set(["inter", "poppins", "mono", "playfair", "jetbrains-mono", "fraunces", "space-grotesk", "fira-code", "outfit", "dm-sans"]);
const VALID_BUTTON_STYLES = new Set(["rounded-fill", "pill-fill", "sharp-fill", "rounded-outline", "pill-outline", "sharp-outline"]);

function sanitize(v: CustomizeValues): UpdateProfilePayload {
  const p: UpdateProfilePayload = {};
  if (VALID_THEMES.has(v.theme))              p.theme        = v.theme;
  if (VALID_BG_TYPES.has(v.bgType))          p.bgType       = v.bgType;
  if (HEX_REGEX.test(v.bgColor))             p.bgColor      = v.bgColor;
  if (HEX_REGEX.test(v.accentColor))         p.accentColor  = v.accentColor;
  if (VALID_FONTS.has(v.fontFamily))         p.fontFamily   = v.fontFamily;
  if (VALID_BUTTON_STYLES.has(v.buttonStyle)) p.buttonStyle = v.buttonStyle;
  if (typeof v.coverImageUrl === "string")   p.coverImageUrl = v.coverImageUrl;
  return p;
}

export function useCustomize() {
  const [values, setValues]       = useState<CustomizeValues>(DEFAULTS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);

  const valuesRef     = useRef<CustomizeValues>(DEFAULTS);
  const timerRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    userApi
      .me()
      .then((profile) => {
        const loaded: CustomizeValues = {
          theme:         VALID_THEMES.has(profile.theme)               ? profile.theme        : DEFAULTS.theme,
          bgType:        VALID_BG_TYPES.has(profile.bgType)           ? profile.bgType       : DEFAULTS.bgType,
          bgColor:       HEX_REGEX.test(profile.bgColor)              ? profile.bgColor      : DEFAULTS.bgColor,
          coverImageUrl: profile.coverImageUrl                        ?? DEFAULTS.coverImageUrl,
          accentColor:   HEX_REGEX.test(profile.accentColor)         ? profile.accentColor  : DEFAULTS.accentColor,
          fontFamily:    VALID_FONTS.has(profile.fontFamily)          ? profile.fontFamily   : DEFAULTS.fontFamily,
          buttonStyle:   VALID_BUTTON_STYLES.has(profile.buttonStyle) ? profile.buttonStyle  : DEFAULTS.buttonStyle,
          stickers:      Array.isArray((profile as unknown as Record<string, unknown>).stickers)
                           ? ((profile as unknown as Record<string, unknown>).stickers as PlacedSticker[])
                           : DEFAULTS.stickers,
        };
        setValues(loaded);
        valuesRef.current = loaded;
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const save = useCallback(async (v: CustomizeValues) => {
    const payload = sanitize(v);
    if (Object.keys(payload).length === 0) return;

    setSaveStatus("saving");
    try {
      await userApi.updateProfile(payload);
      setSaveStatus("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      toast.error("Error al guardar los cambios");
    }
  }, []);

  const update = useCallback(
    (patch: Partial<CustomizeValues>) => {
      setValues((prev) => {
        const next = { ...prev, ...patch };
        valuesRef.current = next;
        return next;
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => save(valuesRef.current), 1200);
    },
    [save],
  );

  const saveStickers = useCallback(async (stickers: PlacedSticker[]) => {
    setSaveStatus("saving");
    try {
      await userApi.updateStickers(stickers);
      setSaveStatus("saved");
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      toast.error("Error al guardar stickers");
    }
  }, []);

  const updateStickers = useCallback(
    (stickers: PlacedSticker[]) => {
      setValues((prev) => {
        const next = { ...prev, stickers };
        valuesRef.current = next;
        return next;
      });
      if (stickerTimerRef.current) clearTimeout(stickerTimerRef.current);
      stickerTimerRef.current = setTimeout(() => saveStickers(stickers), 1000);
    },
    [saveStickers],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      if (stickerTimerRef.current) clearTimeout(stickerTimerRef.current);
    };
  }, []);

  return { values, update, updateStickers, saveStatus, isLoading };
}
