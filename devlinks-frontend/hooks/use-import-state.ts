"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/use-notifications";
import { importProfileSchema } from "@/lib/validations/import-profile.schema";
import { userApi } from "@/lib/api/user.api";
import type {
  ProfileExportJson,
  UserProfile,
  PublicProfile,
  Project,
} from "@/types";
import type { ProfileImportJson } from "@/lib/validations/import-profile.schema";

const EXAMPLE_JSON: ProfileExportJson = {
  version: "1.0",
  profile: {
    displayName: "Ada Lovelace",
    bio: "Desarrolladora de software apasionada por la tecnología, el código limpio y el impacto positivo.",
    location: "Londres, Reino Unido",
    avatarUrl: "https://example.com/avatar.jpg",
    githubUsername: "ada-lovelace",
    theme: "dark",
    accentColor: "#0d9488",
    buttonStyle: "rounded-fill",
    fontFamily: "jetbrains-mono",
    bgType: "gradient",
    bgColor: "#0f172a",
    profileLayout: "classic",
    coverImageUrl: "",
  },
  links: [
    {
      title: "Portafolio",
      url: "https://adalovelace.dev",
      icon: null,
      previewImage: null,
      isPrimary: true,
      displayOrder: 0,
      isActive: true,
      layout: "classic",
    },
    {
      title: "Twitter / X",
      url: "https://twitter.com/ada_lovelace",
      icon: null,
      previewImage: null,
      isPrimary: false,
      displayOrder: 1,
      isActive: true,
      layout: "classic",
    },
  ],
  stickers: [
    { id: "react", x: 10, y: 15, rotation: -12, scale: 1 },
    { id: "typescript", x: 85, y: 20, rotation: 8, scale: 1.2 },
  ],
  projects: [
    {
      title: "analytical-engine",
      description: "Simulador de la Máquina Analítica con JavaScript.",
      url: "https://github.com/ada-lovelace/analytical-engine",
      githubRepo: "ada-lovelace/analytical-engine",
      stars: 1250,
      language: "JavaScript",
      imageUrl: null,
      pinned: true,
      displayOrder: 0,
    },
  ],
};

function getInitialJson(currentConfig: ProfileExportJson | null): string {
  if (currentConfig) {
    return JSON.stringify(currentConfig, null, 2);
  }
  return JSON.stringify(EXAMPLE_JSON, null, 2);
}

export interface UseImportStateProps {
  currentConfig: ProfileExportJson | null;
  user: UserProfile | null;
}

export interface UseImportStateReturn {
  activeTab: "editor" | "file";
  setActiveTab: (tab: "editor" | "file") => void;
  jsonText: string;
  setJsonText: (text: string) => void;
  validationErrors: string[];
  isValid: boolean | null;
  parsedData: ProfileImportJson | null;
  setParsedData: (data: ProfileImportJson | null) => void;
  setIsValid: (valid: boolean | null) => void;
  setValidationErrors: (errors: string[]) => void;
  isImporting: boolean;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  fileError: string | null;
  validateJson: () => boolean;
  handleFileSelect: (file: File) => void;
  handleClear: () => void;
  handleLoadCurrent: () => void;
  handleLoadExample: () => void;
  handleDownload: () => void;
  handleApplyImport: () => Promise<void>;
  previewProfile: PublicProfile | null;
  previewProjects: Project[];
  previewBg: string;
}

export function useImportState({
  currentConfig,
  user,
}: UseImportStateProps): UseImportStateReturn {
  const router = useRouter();
  const { notifySuccess, notifyError, notifyInfo } = useNotifications();
  const [activeTab, setActiveTab] = useState<"editor" | "file">("editor");
  const [jsonText, setJsonText] = useState(() => getInitialJson(currentConfig));
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [parsedData, setParsedData] = useState<ProfileImportJson | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateJson = useCallback(() => {
    setValidationErrors([]);
    setParsedData(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setIsValid(false);
      setValidationErrors([
        "El texto no es JSON válido. Revisa comillas, comas y llaves.",
      ]);
      return false;
    }

    const result = importProfileSchema.safeParse(parsed);
    if (!result.success) {
      setIsValid(false);
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      setValidationErrors(errors);
      return false;
    }

    setIsValid(true);
    setParsedData(result.data);
    notifySuccess("JSON válido. Revisa la preview antes de importar.");
    return true;
  }, [jsonText, notifySuccess]);

  const handleFileSelect = useCallback(
    (file: File) => {
      setFileError(null);
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (!file.name.toLowerCase().endsWith(".json")) {
        setFileError("Solo se permiten archivos .json");
        return;
      }
      if (file.size > MAX_SIZE) {
        setFileError("El archivo excede el límite de 2 MB");
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setJsonText(text);
        setActiveTab("editor");
        setIsValid(null);
        setParsedData(null);
        setValidationErrors([]);
        notifySuccess(`Archivo "${file.name}" cargado en el editor.`);
      };
      reader.readAsText(file);
    },
    [notifySuccess],
  );

  const handleClear = useCallback(() => {
    setFileName(null);
    setFileError(null);
    setJsonText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setIsValid(null);
    setParsedData(null);
    setValidationErrors([]);
  }, []);

  const handleLoadCurrent = useCallback(() => {
    if (currentConfig) {
      setJsonText(JSON.stringify(currentConfig, null, 2));
      setIsValid(null);
      setParsedData(null);
      setValidationErrors([]);
      notifyInfo("Perfil actual cargado en el editor.");
    }
  }, [currentConfig, notifyInfo]);

  const handleLoadExample = useCallback(() => {
    setJsonText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setIsValid(null);
    setParsedData(null);
    setValidationErrors([]);
    notifyInfo("Ejemplo cargado en el editor.");
  }, [notifyInfo]);

  const handleDownload = useCallback(() => {
    if (!currentConfig) return;
    const blob = new Blob([JSON.stringify(currentConfig, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devlinks-config-${user?.username ?? "profile"}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentConfig, user]);

  const handleApplyImport = useCallback(async () => {
    if (!parsedData) {
      const ok = validateJson();
      if (!ok) return;
    }
    let data = parsedData;
    if (!data) {
      let reparsed: unknown;
      try {
        reparsed = JSON.parse(jsonText);
      } catch {
        notifyError("El JSON no es válido.");
        return;
      }
      const result = importProfileSchema.safeParse(reparsed);
      if (!result.success) {
        notifyError("El JSON no cumple el esquema requerido.");
        return;
      }
      data = result.data;
    }

    // Remove version field before sending — backend doesn't accept it
    const importPayload = { ...data } as ProfileImportJson & {
      version?: string;
    };
    delete (importPayload as Record<string, unknown>).version;

    setIsImporting(true);
    try {
      await userApi.importProfile(importPayload);
      notifySuccess("Configuración importada correctamente.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al importar";
      notifyError(message);
    } finally {
      setIsImporting(false);
    }
  }, [parsedData, jsonText, validateJson, router, notifySuccess, notifyError]);

  const previewProfile: PublicProfile | null = useMemo(() => {
    if (!parsedData || !user) return null;

    const base = currentConfig ?? {
      version: "1.0",
      profile: {
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        theme: user.theme,
        accentColor: user.accentColor,
        buttonStyle: user.buttonStyle,
        fontFamily: user.fontFamily,
        bgType: user.bgType,
        bgColor: user.bgColor,
        profileLayout: user.profileLayout,
        coverImageUrl: user.coverImageUrl || "",
        layout: "classic",
        title: null,
        titleStyle: "text",
        titleColor: "#F8FAFC",
        pageTextColor: "#F8FAFC",
        buttonVariant: "solid",
        buttonRadius: 8,
        buttonShadow: "none",
        buttonColor: user.accentColor,
        buttonTextColor: "#FFFFFF",
        altTitleFont: false,
        titleFont: user.titleFont ?? "inter",
      },
      links: [],
      stickers: [],
      projects: [],
    };

    const profileData = parsedData.profile ?? base.profile;

    const links =
      parsedData.links !== undefined
        ? parsedData.links.map((link, i) => ({
            id: `import-link-${i}`,
            title: link.title,
            url: link.url,
            icon: link.icon ?? null,
            previewImage: link.previewImage ?? null,
            isPrimary: link.isPrimary ?? false,
            displayOrder: link.displayOrder ?? i,
            layout: link.layout ?? "classic",
          }))
        : base.links.map((link, i) => ({
            id: `current-link-${i}`,
            title: link.title,
            url: link.url,
            icon: link.icon ?? null,
            previewImage: link.previewImage ?? null,
            isPrimary: link.isPrimary,
            displayOrder: link.displayOrder,
            layout: link.layout ?? "classic",
          }));

    const stickers =
      parsedData.stickers !== undefined ? parsedData.stickers : base.stickers;

    return {
      id: user.id,
      username: user.username,
      displayName: profileData.displayName ?? base.profile.displayName,
      bio: profileData.bio ?? base.profile.bio,
      location: profileData.location ?? base.profile.location,
      avatarUrl: profileData.avatarUrl ?? base.profile.avatarUrl,
      githubUsername: profileData.githubUsername ?? base.profile.githubUsername,
      theme: profileData.theme ?? base.profile.theme,
      accentColor: profileData.accentColor ?? base.profile.accentColor,
      buttonStyle: profileData.buttonStyle ?? base.profile.buttonStyle,
      fontFamily: profileData.fontFamily ?? base.profile.fontFamily,
      bgType: profileData.bgType ?? base.profile.bgType,
      bgColor: profileData.bgColor ?? base.profile.bgColor,
      profileLayout: profileData.profileLayout ?? base.profile.profileLayout,
      coverImageUrl:
        profileData.coverImageUrl !== undefined
          ? (profileData.coverImageUrl ?? "")
          : base.profile.coverImageUrl,
      layout:
        ((profileData as Record<string, unknown>).layout as string) ??
        "classic",
      title: ((profileData as Record<string, unknown>).title ?? null) as
        | string
        | null,
      titleStyle:
        ((profileData as Record<string, unknown>).titleStyle as string) ??
        "text",
      titleColor:
        ((profileData as Record<string, unknown>).titleColor as string) ??
        "#F8FAFC",
      pageTextColor:
        ((profileData as Record<string, unknown>).pageTextColor as string) ??
        "#F8FAFC",
      buttonVariant:
        ((profileData as Record<string, unknown>).buttonVariant as string) ??
        "solid",
      buttonRadius:
        ((profileData as Record<string, unknown>).buttonRadius as number) ?? 8,
      buttonShadow:
        ((profileData as Record<string, unknown>).buttonShadow as string) ??
        "none",
      buttonColor:
        ((profileData as Record<string, unknown>).buttonColor as string) ??
        profileData.accentColor ??
        base.profile.accentColor,
      buttonTextColor:
        ((profileData as Record<string, unknown>).buttonTextColor as string) ??
        "#FFFFFF",
      altTitleFont:
        ((profileData as Record<string, unknown>).altTitleFont as boolean) ??
        false,
      titleFont:
        ((profileData as Record<string, unknown>).titleFont as string) ??
        base.profile.titleFont,
      stickers: stickers.length > 0 ? stickers : null,
      links,
      projects: [],
    };
  }, [parsedData, user, currentConfig]);

  const previewProjects: Project[] = useMemo(() => {
    if (!parsedData || !user) return [];

    const base = currentConfig;
    const projects =
      parsedData.projects !== undefined
        ? parsedData.projects
        : (base?.projects ?? []);

    return projects.map((p, i) => ({
      id: `import-project-${i}`,
      title: p.title,
      description: p.description ?? null,
      url: p.url ?? null,
      githubRepo: p.githubRepo ?? "",
      stars: p.stars ?? 0,
      language: p.language ?? null,
      pinned: p.pinned ?? false,
      displayOrder: p.displayOrder ?? i,
    }));
  }, [parsedData, user, currentConfig]);

  const previewBg = useMemo(() => {
    const profile = previewProfile;
    if (!profile) return "#0f172a";
    return profile.bgType === "gradient"
      ? `linear-gradient(160deg, color-mix(in srgb, ${profile.bgColor} 85%, #000 15%) 0%, color-mix(in srgb, ${profile.bgColor} 60%, ${profile.accentColor} 40%) 100%)`
      : profile.bgColor;
  }, [previewProfile]);

  return {
    activeTab,
    setActiveTab,
    jsonText,
    setJsonText,
    validationErrors,
    isValid,
    parsedData,
    setParsedData,
    setIsValid,
    setValidationErrors,
    isImporting,
    fileName,
    setFileName,
    fileError,
    validateJson,
    handleFileSelect,
    handleClear,
    handleLoadCurrent,
    handleLoadExample,
    handleDownload,
    handleApplyImport,
    previewProfile,
    previewProjects,
    previewBg,
  };
}
