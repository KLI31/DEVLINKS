"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/settings/avatarUpload";
import type { AvatarUploadResult } from "@/components/settings/avatarUploadModal";
import { User, Shield, Save, MapPin, Loader2 } from "lucide-react";
import { userApi } from "@/lib/api/user.api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [avatarResult, setAvatarResult] = useState<AvatarUploadResult>(null);

  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || "",
    slug: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSuggestion, setLocationSuggestion] = useState<string | null>(
    null,
  );

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

    // TODO: upload file to server when backend supports multipart upload
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

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar el perfil";
      toast.error(message);
    }
  };

  const detectLocation = async () => {
    setLocationLoading(true);
    setLocationSuggestion(null);
    try {
      const result = await userApi.getLocationSuggestion();

      if (result.formatted) {
        setLocationSuggestion(result.formatted);
      } else {
        toast.error("No se pudo detectar la ubicación");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al detectar ubicación";
      toast.error(message);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Ajustes</h1>
        <p className="text-xs text-muted-foreground">
          Gestiona tu perfil, cuenta y preferencias.
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-1 flex-col min-h-0"
      >
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="profile">
            <User className="mr-1.5 size-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="account">
            <Shield className="mr-1.5 size-4" />
            Cuenta
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-3 flex-1 overflow-hidden">
          <form
            onSubmit={handleProfileSubmit}
            className="flex h-full flex-col gap-3"
          >
            <div className="flex-1 overflow-y-auto scroll-thin">
              <div className="rounded-xl border border-border/70 bg-card p-4 ">
                <h3 className="mb-3 text-sm font-semibold text-card-foreground">
                  Perfil público
                </h3>

                <AvatarUpload
                  src={user?.avatarUrl}
                  fallback={initials}
                  onChange={(result) => setAvatarResult(result)}
                />

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="displayName"
                      className="mb-1 block text-xs font-medium text-card-foreground"
                    >
                      Nombre visible
                    </label>
                    <Input
                      id="displayName"
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
                    <label
                      htmlFor="slug"
                      className="mb-1 block text-xs font-medium text-card-foreground"
                    >
                      Nombre de usuario
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        /u/
                      </span>
                      <Input
                        id="slug"
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
                  </div>
                </div>

                <div className="mt-3">
                  <label
                    htmlFor="bio"
                    className="mb-1 block text-xs font-medium text-card-foreground"
                  >
                    Bio
                  </label>
                  <Textarea
                    id="bio"
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
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {profileForm.bio.length}/160
                  </p>
                </div>

                <div className="mt-3">
                  <label
                    htmlFor="location"
                    className="mb-1 block text-xs font-medium text-card-foreground"
                  >
                    Ubicación
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      value={profileForm.location}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Ciudad, País · Remote · etc."
                      maxLength={100}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={detectLocation}
                      disabled={locationLoading}
                      title="Detectar ubicación"
                    >
                      {locationLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <MapPin className="size-4" />
                      )}
                    </Button>
                  </div>
                  {locationSuggestion && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        Detectado: {locationSuggestion}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileForm((prev) => ({
                            ...prev,
                            location: locationSuggestion,
                          }));
                          setLocationSuggestion(null);
                        }}
                        className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 font-medium text-foreground hover:bg-muted"
                      >
                        Usar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" size="sm" className="gap-1.5">
                <Save className="size-4" />
                Guardar
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="account" className="mt-3 flex-1 overflow-hidden">
          <form
            onSubmit={handleAccountSubmit}
            className="flex h-full flex-col gap-3"
          >
            <div className="flex-1 overflow-y-auto scroll-thin space-y-3">
              <div className="rounded-xl border border-border/70 bg-card p-4 ">
                <h3 className="mb-3 text-sm font-semibold text-card-foreground">
                  Información de cuenta
                </h3>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-xs font-medium text-card-foreground"
                  >
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    type="email"
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
                  <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-border/70 bg-muted/40 px-2.5 py-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background text-foreground shadow-sm ring-1 ring-border/60">
                      <svg
                        viewBox="0 0 24 24"
                        className="size-3.5"
                        fill="currentColor"
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
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-4 ">
                <h3 className="mb-3 text-sm font-semibold text-card-foreground">
                  Cambiar contraseña
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="mb-1 block text-xs font-medium text-card-foreground"
                    >
                      Contraseña actual
                    </label>
                    <Input
                      id="currentPassword"
                      type="password"
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
                    <label
                      htmlFor="newPassword"
                      className="mb-1 block text-xs font-medium text-card-foreground"
                    >
                      Nueva contraseña
                    </label>
                    <Input
                      id="newPassword"
                      type="password"
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
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" size="sm" className="gap-1.5">
                <Save className="size-4" />
                Guardar
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
