"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/register.schema";
import { getIconUrl } from "@/lib/icons";
import {
  getPasswordStrength,
  getPasswordStrengthLabel,
  type PasswordStrength,
} from "@/lib/password";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameFromQuery =
    searchParams.get("username")?.trim().replace(/[^a-zA-Z0-9_]/g, "") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      "display-name": "",
      username: usernameFromQuery,
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
        displayName: data["display-name"],
      });
      toast.success("¡Cuenta creada exitosamente!");
      router.push("/dashboard");
    } catch {
      // Error ya manejado por el store
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setStrength(getPasswordStrength(value));
    } else {
      setStrength(null);
    }
  };

  const strengthLabel = strength ? getPasswordStrengthLabel(strength) : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex min-h-screen flex-col items-center justify-center px-4 pt-10"
    >
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo.svg"
              alt="DevLinks"
              width={48}
              height={32}
              priority
            />
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Crear cuenta
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Únete a DevLinks gratis
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => {
              const backendUrl =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
              window.location.assign(`${backendUrl}/auth/github`);
            }}
          >
            <Image
              src={getIconUrl("github")}
              alt="GitHub"
              width={20}
              height={20}
              unoptimized
              className="mr-2"
            />
            Continuar con GitHub
          </Button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  o con email
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="display-name"
                className="text-sm font-medium text-foreground"
              >
                Nombre
              </label>
              <Input
                id="display-name"
                type="text"
                placeholder="Andrés Ramírez"
                autoComplete="name"
                aria-invalid={!!errors["display-name"]}
                {...register("display-name")}
              />
              {errors["display-name"] && (
                <p className="text-xs text-destructive">
                  {errors["display-name"].message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="text-sm font-medium text-foreground"
              >
                Usuario
              </label>
              <Input
                id="username"
                type="text"
                placeholder="andresdev"
                autoComplete="username"
                aria-invalid={!!errors.username}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-xs text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Contraseña
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className="pr-10"
                  {...register("password")}
                  onChange={(e) => {
                    register("password").onChange(e);
                    handlePasswordChange(e);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {strength && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex h-1.5 w-full gap-1">
                    <div
                      className={cn(
                        "h-full flex-1 rounded-full transition-all",
                        strength === "weak" && "bg-destructive",
                        strength === "fair" && "bg-warning",
                        strength === "good" && "bg-primary",
                        strength === "strong" && "bg-success",
                      )}
                    />
                    <div
                      className={cn(
                        "h-full flex-1 rounded-full bg-muted transition-all",
                        strength === "weak" && "bg-destructive/30",
                        strength === "fair" && "bg-warning/30",
                        strength === "good" && "bg-primary/30",
                        strength === "strong" && "bg-success/30",
                      )}
                    />
                    <div
                      className={cn(
                        "h-full flex-1 rounded-full bg-muted transition-all",
                        (strength === "weak" || strength === "fair") &&
                          "bg-muted/50",
                        strength === "good" && "bg-primary/30",
                        strength === "strong" && "bg-success/30",
                      )}
                    />
                    <div
                      className={cn(
                        "h-full flex-1 rounded-full bg-muted transition-all",
                        strength === "strong" ? "bg-success/30" : "bg-muted/50",
                      )}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-xs font-medium",
                      strength === "weak" && "text-destructive",
                      strength === "fair" && "text-warning",
                      strength === "good" && "text-primary",
                      strength === "strong" && "text-success",
                    )}
                  >
                    {strengthLabel}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
