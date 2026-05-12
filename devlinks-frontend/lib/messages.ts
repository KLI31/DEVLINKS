export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: (name: string) => `Bienvenido de vuelta, ${name}`,
  LOGIN_ERROR_INVALID: "Credenciales inválidas. Revisa tu email y contraseña.",
  LOGIN_ERROR_INACTIVE: "Tu cuenta está desactivada. Contacta soporte.",
  GITHUB_LOGIN_SUCCESS: "Login con GitHub exitoso. Bienvenido.",

  REGISTER_SUCCESS: "Cuenta creada correctamente. Bienvenido.",
  REGISTER_ERROR_CONFLICT: "El email o nombre de usuario ya está en uso.",

  LOGOUT_SUCCESS: "Sesión cerrada correctamente.",

  SESSION_EXPIRED: "Tu sesión expiró. Inicia sesión de nuevo.",
} as const;

export const GENERAL_MESSAGES = {
  NETWORK_ERROR: "No se pudo conectar con el servidor. Intenta de nuevo.",
  UNKNOWN_ERROR: "Algo salió mal. Intenta de nuevo.",
} as const;

export function resolveErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");

  if (!raw || raw === "[object Object]") return GENERAL_MESSAGES.UNKNOWN_ERROR;

  if (
    raw.toLowerCase().includes("fetch") ||
    raw.toLowerCase().includes("network") ||
    raw.toLowerCase().includes("failed to fetch")
  ) {
    return GENERAL_MESSAGES.NETWORK_ERROR;
  }

  if (
    raw.includes("Credenciales inválidas") ||
    raw.includes("Invalid credentials")
  ) {
    return AUTH_MESSAGES.LOGIN_ERROR_INVALID;
  }

  if (
    raw.includes("ya están en uso") ||
    raw.includes("already taken") ||
    raw.includes("Conflict")
  ) {
    return AUTH_MESSAGES.REGISTER_ERROR_CONFLICT;
  }

  if (
    raw.includes("desactivada") ||
    raw.includes("inactive") ||
    raw.includes("isActive")
  ) {
    return AUTH_MESSAGES.LOGIN_ERROR_INACTIVE;
  }

  if (
    raw.includes("Sesión expirada") ||
    raw.includes("Token inválido") ||
    raw.includes("Unauthorized")
  ) {
    return AUTH_MESSAGES.SESSION_EXPIRED;
  }

  // Retorna el mensaje del backend directamente si es legible
  return raw;
}
