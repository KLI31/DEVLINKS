"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileJson,
  Upload,
  Play,
  FileCode,
  User,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { userApi } from "@/lib/api/user.api";
import { importProfileSchema } from "@/lib/validations/import-profile.schema";
import type {
  ProfileExportJson,
  UserProfile,
  PublicProfile,
  Project,
} from "@/types";
import type { ProfileImportJson } from "@/lib/validations/import-profile.schema";
import { DropZone } from "@/components/import/DropZone";
import { JsonCodeBlock } from "@/components/import/JsonCodeBlock";
import { ImportPreview } from "@/components/import/ImportPreview";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { JsonEditor } from "@/components/import/JsonEditor";
import { SchemaDocs } from "@/components/import/SchemaDocs";
import { cn } from "@/lib/utils";

interface ImportPageClientProps {
  currentConfig: ProfileExportJson | null;
  user: UserProfile | null;
}

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
    },
    {
      title: "Twitter / X",
      url: "https://twitter.com/ada_lovelace",
      icon: null,
      previewImage: null,
      isPrimary: false,
      displayOrder: 1,
      isActive: true,
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

export function ImportPageClient({
  currentConfig,
  user,
}: ImportPageClientProps) {
  const router = useRouter();
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
    toast.success("JSON válido. Revisa la preview antes de importar.");
    return true;
  }, [jsonText]);

  const handleFileSelect = useCallback((file: File) => {
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
      toast.success(`Archivo "${file.name}" cargado en el editor.`);
    };
    reader.readAsText(file);
  }, []);

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
      toast.info("Perfil actual cargado en el editor.");
    }
  }, [currentConfig]);

  const handleLoadExample = useCallback(() => {
    setJsonText(JSON.stringify(EXAMPLE_JSON, null, 2));
    setIsValid(null);
    setParsedData(null);
    setValidationErrors([]);
    toast.info("Ejemplo cargado en el editor.");
  }, []);

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
        toast.error("El JSON no es válido.");
        return;
      }
      const result = importProfileSchema.safeParse(reparsed);
      if (!result.success) {
        toast.error("El JSON no cumple el esquema requerido.");
        return;
      }
      data = result.data;
    }

    setIsImporting(true);
    try {
      await userApi.importProfile(data);
      toast.success("Configuración importada correctamente.");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al importar";
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  }, [parsedData, jsonText, validateJson, router]);

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
          }))
        : base.links.map((link, i) => ({
            id: `current-link-${i}`,
            title: link.title,
            url: link.url,
            icon: link.icon ?? null,
            previewImage: link.previewImage ?? null,
            isPrimary: link.isPrimary,
            displayOrder: link.displayOrder,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Importar perfil desde JSON
          </h1>
          <p className="text-sm text-muted-foreground">
            Crea o actualiza tu perfil a partir de un archivo JSON
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={validateJson}
            className="gap-2"
          >
            <Play className="size-4" />
            Validar JSON
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApplyImport}
            disabled={isImporting}
            className="gap-2"
          >
            <Upload className="size-4" />
            {isImporting ? "Importando..." : "Importar"}
          </Button>
          {currentConfig && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="size-4" />
              Descargar JSON
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
            activeTab === "editor"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <FileCode className="size-4" />
          Editor JSON
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("file")}
          className={cn(
            "flex items-center gap-2 border-b-2 px-1 pb-2 text-sm font-medium transition-colors",
            activeTab === "file"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <Upload className="size-4" />
          Archivo
        </button>
      </div>

      {activeTab === "editor" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={handleLoadExample}
              className="gap-1.5 text-xs"
            >
              <FileJson className="size-3.5" />
              Ver ejemplo
            </Button>
            {currentConfig && (
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={handleLoadCurrent}
                className="gap-1.5 text-xs"
              >
                <User className="size-3.5" />
                Usar perfil actual
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleClear}
              className="gap-1.5 text-xs"
            >
              <RotateCcw className="size-3.5" />
              Restablecer
            </Button>
          </div>

          <JsonEditor
            value={jsonText}
            onChange={setJsonText}
            isValid={isValid}
            errorCount={validationErrors.length}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <DropZone
            onFileSelect={handleFileSelect}
            onClear={() => setFileName(null)}
            fileName={fileName}
            error={fileError}
          />
          <p className="text-xs text-muted-foreground">
            Al cargar un archivo, su contenido se transferirá automáticamente al
            editor JSON.
          </p>
        </div>
      )}

      {isValid !== null && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm",
            isValid
              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/30 bg-destructive/5 text-destructive",
          )}
        >
          {isValid ? (
            <CheckCircle className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span className="font-medium">
            {isValid
              ? "JSON válido — sin errores encontrados"
              : `${validationErrors.length} error${validationErrors.length !== 1 ? "es" : ""} de validación`}
          </span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <ul className="space-y-1">
            {validationErrors.map((err, i) => (
              <li key={i} className="text-xs text-destructive">
                • {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <SchemaDocs />

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <Lightbulb className="size-4 shrink-0 text-muted-foreground" />
        <span>
          Tip: Puedes validar tu JSON antes de importar para asegurarte de que
          cumple el esquema. La importación es parcial — solo se actualizan las
          secciones que incluyas.
        </span>
      </p>

      {parsedData && previewProfile && (
        <section className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold text-foreground">
            Preview de cambios
          </h2>

          <ImportPreview
            importData={parsedData}
            currentConfig={currentConfig}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Vista previa del card
              </h3>
              <div
                className="rounded-xl p-4 overflow-auto max-h-[600px]"
                style={{ background: previewBg }}
              >
                <PublicProfileCard
                  profile={previewProfile}
                  projects={previewProjects}
                  githubStats={null}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                JSON a importar
              </h3>
              <JsonCodeBlock data={parsedData} className="max-h-[400px]" />

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setParsedData(null);
                    setIsValid(null);
                  }}
                  className="gap-2"
                >
                  <RotateCcw className="size-4" />
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyImport}
                  disabled={isImporting}
                  className="gap-2"
                >
                  <CheckCircle className="size-4" />
                  {isImporting ? "Importando..." : "Aplicar importación"}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
