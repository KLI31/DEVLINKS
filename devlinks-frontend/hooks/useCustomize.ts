"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { userApi } from "@/lib/api/user.api";
import type { PlacedSticker, UpdateProfilePayload } from "@/types";
import { useNotifications } from "@/hooks/use-notifications";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type CustomizeValues = {
  theme: string;
  bgType: string;
  bgColor: string;
  coverImageUrl: string;
  accentColor: string;
  fontFamily: string;
  buttonStyle: string;
  layout: string;
  title: string | null;
  titleStyle: string;
  titleColor: string;
  pageTextColor: string;
  buttonVariant: string;
  buttonRadius: number;
  buttonShadow: string;
  buttonColor: string;
  buttonTextColor: string;
  altTitleFont: boolean;
  titleFont: string;
  stickers: PlacedSticker[];
};

const DEFAULTS: CustomizeValues = {
  theme: "dark",
  bgType: "fill",
  bgColor: "#0F172A",
  coverImageUrl: "",
  accentColor: "#0D9488",
  fontFamily: "jetbrains-mono",
  buttonStyle: "rounded-fill",
  layout: "classic",
  title: null,
  titleStyle: "text",
  titleColor: "#F8FAFC",
  pageTextColor: "#F8FAFC",
  buttonVariant: "solid",
  buttonRadius: 8,
  buttonShadow: "none",
  buttonColor: "#0D9488",
  buttonTextColor: "#FFFFFF",
  altTitleFont: false,
  titleFont: "playfair",
  stickers: [],
};

const HEX_REGEX = /^#[0-9A-Fa-f]{6}$/;
const VALID_THEMES = new Set(["dark", "light", "midnight", "ocean", "rose"]);
const VALID_BG_TYPES = new Set(["flat", "gradient", "fill", "blur", "pattern"]);
const VALID_FONTS = new Set([
  "inter", "poppins", "mono", "playfair", "jetbrains-mono", "fraunces",
  "space-grotesk", "fira-code", "outfit", "dm-sans",
]);
const VALID_BUTTON_STYLES = new Set([
  "rounded-fill", "pill-fill", "sharp-fill",
  "rounded-outline", "pill-outline", "sharp-outline",
]);
const VALID_LAYOUTS = new Set(["classic", "hero"]);
const VALID_TITLE_STYLES = new Set(["text", "logo"]);
const VALID_BUTTON_VARIANTS = new Set(["solid", "glass", "outline"]);
const VALID_BUTTON_SHADOWS = new Set(["none", "soft", "strong", "hard"]);

function migrateButtonStyle(buttonStyle?: string): { buttonVariant: string; buttonRadius: number } {
  if (!buttonStyle) return { buttonVariant: DEFAULTS.buttonVariant, buttonRadius: DEFAULTS.buttonRadius };
  const map: Record<string, { buttonVariant: string; buttonRadius: number }> = {
    "rounded-fill": { buttonVariant: "solid", buttonRadius: 8 },
    "sharp-fill": { buttonVariant: "solid", buttonRadius: 2 },
    "pill-fill": { buttonVariant: "solid", buttonRadius: 9999 },
    "rounded-outline": { buttonVariant: "outline", buttonRadius: 8 },
    "sharp-outline": { buttonVariant: "outline", buttonRadius: 2 },
    "pill-outline": { buttonVariant: "outline", buttonRadius: 9999 },
  };
  return map[buttonStyle] ?? { buttonVariant: DEFAULTS.buttonVariant, buttonRadius: DEFAULTS.buttonRadius };
}

function sanitize(v: CustomizeValues): UpdateProfilePayload {
  const p: UpdateProfilePayload = {};
  if (VALID_THEMES.has(v.theme)) p.theme = v.theme;
  if (VALID_BG_TYPES.has(v.bgType)) p.bgType = v.bgType;
  if (HEX_REGEX.test(v.bgColor)) p.bgColor = v.bgColor;
  if (HEX_REGEX.test(v.accentColor)) p.accentColor = v.accentColor;
  if (VALID_FONTS.has(v.fontFamily)) p.fontFamily = v.fontFamily;
  if (VALID_BUTTON_STYLES.has(v.buttonStyle)) p.buttonStyle = v.buttonStyle;
  if (typeof v.coverImageUrl === "string") p.coverImageUrl = v.coverImageUrl;
  if (VALID_LAYOUTS.has(v.layout)) p.layout = v.layout;
  if (typeof v.title === "string" || v.title === null) p.title = v.title;
  if (VALID_TITLE_STYLES.has(v.titleStyle)) p.titleStyle = v.titleStyle;
  if (HEX_REGEX.test(v.titleColor)) p.titleColor = v.titleColor;
  if (HEX_REGEX.test(v.pageTextColor)) p.pageTextColor = v.pageTextColor;
  if (VALID_BUTTON_VARIANTS.has(v.buttonVariant)) p.buttonVariant = v.buttonVariant;
  if (typeof v.buttonRadius === "number") p.buttonRadius = v.buttonRadius;
  if (VALID_BUTTON_SHADOWS.has(v.buttonShadow)) p.buttonShadow = v.buttonShadow;
  if (HEX_REGEX.test(v.buttonColor)) p.buttonColor = v.buttonColor;
  if (HEX_REGEX.test(v.buttonTextColor)) p.buttonTextColor = v.buttonTextColor;
  if (typeof v.altTitleFont === "boolean") p.altTitleFont = v.altTitleFont;
  if (VALID_FONTS.has(v.titleFont)) p.titleFont = v.titleFont;
  return p;
}

export function useCustomize() {
  const { notifyError } = useNotifications();
  const [values, setValues] = useState<CustomizeValues>(DEFAULTS);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoading, setIsLoading] = useState(true);

  const valuesRef = useRef<CustomizeValues>(DEFAULTS);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stickerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    userApi
      .me()
      .then((profile) => {
        const migrated = migrateButtonStyle(profile.buttonStyle);
        const loaded: CustomizeValues = {
          theme: VALID_THEMES.has(profile.theme) ? profile.theme : DEFAULTS.theme,
          bgType: VALID_BG_TYPES.has(profile.bgType) ? profile.bgType : DEFAULTS.bgType,
          bgColor: HEX_REGEX.test(profile.bgColor) ? profile.bgColor : DEFAULTS.bgColor,
          coverImageUrl: profile.coverImageUrl ?? DEFAULTS.coverImageUrl,
          accentColor: HEX_REGEX.test(profile.accentColor) ? profile.accentColor : DEFAULTS.accentColor,
          fontFamily: VALID_FONTS.has(profile.fontFamily) ? profile.fontFamily : DEFAULTS.fontFamily,
          buttonStyle: VALID_BUTTON_STYLES.has(profile.buttonStyle) ? profile.buttonStyle : DEFAULTS.buttonStyle,
          layout: VALID_LAYOUTS.has(profile.layout) ? profile.layout : DEFAULTS.layout,
          title: profile.title ?? DEFAULTS.title,
          titleStyle: VALID_TITLE_STYLES.has(profile.titleStyle) ? profile.titleStyle : DEFAULTS.titleStyle,
          titleColor: HEX_REGEX.test(profile.titleColor) ? profile.titleColor : DEFAULTS.titleColor,
          pageTextColor: HEX_REGEX.test(profile.pageTextColor) ? profile.pageTextColor : DEFAULTS.pageTextColor,
          buttonVariant: VALID_BUTTON_VARIANTS.has(profile.buttonVariant)
            ? profile.buttonVariant
            : migrated.buttonVariant,
          buttonRadius: typeof profile.buttonRadius === "number" ? profile.buttonRadius : migrated.buttonRadius,
          buttonShadow: VALID_BUTTON_SHADOWS.has(profile.buttonShadow)
            ? profile.buttonShadow
            : DEFAULTS.buttonShadow,
          buttonColor: HEX_REGEX.test(profile.buttonColor) ? profile.buttonColor : profile.accentColor ?? DEFAULTS.buttonColor,
          buttonTextColor: HEX_REGEX.test(profile.buttonTextColor)
            ? profile.buttonTextColor
            : DEFAULTS.buttonTextColor,
          altTitleFont: typeof profile.altTitleFont === "boolean" ? profile.altTitleFont : DEFAULTS.altTitleFont,
          titleFont: VALID_FONTS.has((profile as unknown as Record<string, string>).titleFont)
            ? (profile as unknown as Record<string, string>).titleFont
            : DEFAULTS.titleFont,
          stickers: Array.isArray((profile as unknown as Record<string, unknown>).stickers)
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
      notifyError("Error al guardar los cambios");
    }
  }, [notifyError]);

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
      notifyError("Error al guardar stickers");
    }
  }, [notifyError]);

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
