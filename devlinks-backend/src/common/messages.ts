export const USER_MESSAGES = {
  NOT_FOUND: 'Usuario no encontrado',
  USERNAME_TAKEN: 'El nombre de usuario ya está en uso',
  ACCOUNT_DEACTIVATED: 'Cuenta desactivada correctamente',
  FORBIDDEN: 'No tienes permiso para realizar esta acción',
  WRONG_CURRENT_PASSWORD: 'La contraseña actual es incorrecta',
  PASSWORD_CHANGED: 'Contraseña actualizada correctamente',
} as const;

export const LINK_MESSAGES = {
  NOT_FOUND: 'Link no encontrado',
  FORBIDDEN: 'No tienes permiso para modificar este link',
  DELETED: 'Link eliminado correctamente',
  REORDERED: 'Links reordenados correctamente',
} as const;

export const AUTH_MESSAGES = {
  // Login
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  ACCOUNT_INACTIVE: 'Cuenta desactivada',

  // Register
  EMAIL_OR_USERNAME_TAKEN: 'El email o el nombre de usuario ya están en uso',

  // Tokens
  TOKEN_INVALID_OR_EXPIRED: 'Token inválido o expirado',
  REFRESH_TOKEN_INVALID: 'Refresh token inválido o expirado',
  SESSION_EXPIRED: 'Sesión expirada. Por favor inicia sesión de nuevo.',

  // Logout
  LOGOUT_SUCCESS: 'Sesión cerrada correctamente',

  // OAuth
  GITHUB_ACCOUNT_INACTIVE: 'Cuenta de GitHub desactivada',
} as const;
