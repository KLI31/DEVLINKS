"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/settings/avatarUpload";
import type { AvatarUploadResult } from "@/components/settings/avatarUploadModal";
import { Save, MapPin, Loader2, RefreshCw } from "lucide-react";
import { userApi } from "@/lib/api/user.api";
import { useNotifications } from "@/hooks/use-notifications";

const labelClass = "mb-1 block text-xs font-medium text-card-foreground";

function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-4 p-4 md:grid-cols-[220px_1fr] md:gap-8 md:p-6"
    >
      <div>
        <h2 id={id} className="text-sm font-semibold text-card-foreground">
          {title}
        </h2>
        <p className="mt-1 text-xs text-pretty text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { notifySuccess, notifyError } = useNotifications();
  const [avatarResult, setAvatarResult] = useState<AvatarUploadResult>(null);

  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || "",
    slug: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });

  const [locationLoading, setLocationLoading] = useState(false);

  const [accountForm, setAccountForm] = useState({
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
  });

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: {
      displayName?: string;
      username?: string;
      bio?: string;
      location?: string;
      avatarUrl?: string;
    } = {
      displayName: profileForm.displayName,
      username: profileForm.slug,
      bio: profileForm.bio,
      location: profileForm.location,
    };

    if (avatarResult?.type === "url") {
      payload.avatarUrl = avatarResult.url;
    }

    if (avatarResult?.type === "file") {
      console.warn("File upload not yet supported by backend");
    }

    try {
      const updated = await userApi.updateProfile(payload);

      if (user) {
        setUser({
          ...user,
          displayName: updated.displayName,
          username: updated.username,
          bio: updated.bio,
          location: updated.location,
          avatarUrl: updated.avatarUrl,
        });
      }

      notifySuccess("Perfil actualizado correctamente");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar el perfil";
      notifyError(message);
    }
  };

  const detectLocation = async (silent = false) => {
    setLocationLoading(true);
    try {
      const result = await userApi.getLocationSuggestion();

      if (result.formatted) {
        setProfileForm((prev) => ({
          ...prev,
          location: result.formatted ?? "",
        }));
      } else if (!silent) {
        notifyError("No se pudo detectar la ubicación");
      }
    } catch (error) {
      if (!silent) {
        const message =
          error instanceof Error
            ? error.message
            : "Error al detectar ubicación";
        notifyError(message);
      }
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    if (!profileForm.location) {
      detectLocation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Ajustes</h1>
        <p className="text-xs text-muted-foreground">
          Gestiona tu perfil, cuenta y preferencias.
        </p>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="flex flex-1 flex-col divide-y divide-border/70 rounded-xl border border-border/70 bg-card"
      >
        <div className="flex-1 divide-y divide-border/70">
          <SettingsSection
            id="profile-heading"
            title="Perfil público"
            description="Así te verán quienes visiten tu página de DevLinks."
          >
            <AvatarUpload
              src={user?.avatarUrl}
              fallback={initials}
              onChange={(result) => setAvatarResult(result)}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="displayName" className={labelClass}>
                  Nombre visible
                </label>
                <Input
                  id="displayName"
                  autoComplete="name"
                  value={profileForm.displayName}
                  onChange={(e) =>
                    setProfileForm((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))
                  }
                  placeholder="Tu nombre"
                  maxLength={50}
                />
              </div>
              <div>
                <label htmlFor="slug" className={labelClass}>
                  Nombre de usuario
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                  >
                    /u/
                  </span>
                  <Input
                    id="slug"
                    autoComplete="username"
                    aria-describedby="slug-hint"
                    value={profileForm.slug}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    className="pl-10"
                    placeholder="usuario"
                    maxLength={30}
                  />
                </div>
                <p id="slug-hint" className="sr-only">
                  Tu URL pública será /u/{profileForm.slug || "usuario"}
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className={labelClass}>
                Bio
              </label>
              <Textarea
                id="bio"
                aria-describedby="bio-count"
                value={profileForm.bio}
                onChange={(e) =>
                  setProfileForm((prev) => ({
                    ...prev,
                    bio: e.target.value,
                  }))
                }
                placeholder="Cuéntanos algo sobre ti..."
                maxLength={160}
                className="min-h-[4rem]"
              />
              <p
                id="bio-count"
                aria-live="polite"
                className="mt-1 text-right text-xs tabular-nums text-muted-foreground"
              >
                {profileForm.bio.length}/160
              </p>
            </div>

            <div>
              <p id="location-label" className={labelClass}>
                Ubicación
              </p>
              <div
                role="group"
                aria-labelledby="location-label"
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 py-1 pl-3 pr-1"
              >
                <MapPin
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span
                  aria-live="polite"
                  className="flex-1 text-sm text-foreground"
                >
                  {locationLoading ? (
                    <span className="text-muted-foreground">
                      Detectando ubicación...
                    </span>
                  ) : profileForm.location ? (
                    profileForm.location
                  ) : (
                    <span className="text-muted-foreground">
                      Sin ubicación detectada
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => detectLocation(false)}
                  disabled={locationLoading}
                  aria-label="Re-detectar ubicación"
                  title="Re-detectar ubicación"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 md:size-8"
                >
                  {locationLoading ? (
                    <Loader2
                      className="size-3.5 motion-safe:animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </SettingsSection>

          <div className="divide-y divide-border/70">
            <SettingsSection
              id="account-heading"
              title="Cuenta"
              description="Tu correo de acceso y las cuentas conectadas."
            >
              <div className="md:max-w-[calc(50%-0.5rem)]">
                <label htmlFor="email" className={labelClass}>
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={accountForm.email}
                  onChange={(e) =>
                    setAccountForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="tu@email.com"
                />
              </div>

              {user?.githubUsername && (
                <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-sm ring-1 ring-border/60">
                    <svg
                      viewBox="0 0 24 24"
                      className="size-3.5"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-tight">
                      Conectado con GitHub
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      @{user.githubUsername}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span
                      className="size-1.5 rounded-full bg-emerald-500"
                      aria-hidden="true"
                    />
                    Activo
                  </span>
                </div>
              )}
            </SettingsSection>

            <SettingsSection
              id="security-heading"
              title="Seguridad"
              description="Cambia la contraseña con la que inicias sesión."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="currentPassword" className={labelClass}>
                    Contraseña actual
                  </label>
                  <Input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={accountForm.currentPassword}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className={labelClass}>
                    Nueva contraseña
                  </label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={accountForm.newPassword}
                    onChange={(e) =>
                      setAccountForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </SettingsSection>
          </div>
        </div>

        <div className="flex justify-end px-4 py-3 md:px-6">
          <Button
            type="submit"
            size="sm"
            className="min-h-11 gap-1.5 md:min-h-8"
          >
            <Save className="size-4" aria-hidden="true" />
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
