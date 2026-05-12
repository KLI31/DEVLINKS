export const jwtConfig = {
  secret: process.env.JWT_SECRET ?? 'secret',
  expiresIn: process.env.JWT_EXPIRES_IN ?? process.env.JWT_EXPIRY ?? '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? 'refresh-secret',
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRY ?? '7d',
};

/** Convierte valores tipo `7d`, `15m`, `12h` en una fecha de expiración. */
export function parseDurationToDate(expiry: string): Date {
  const m = expiry.trim().match(/^(\d+)(d|h|m|s)$/);
  if (!m) {
    return new Date(Date.now() + 7 * 86400000);
  }
  const n = parseInt(m[1], 10);
  const mult: Record<string, number> = {
    d: 86400000,
    h: 3600000,
    m: 60000,
    s: 1000,
  };
  return new Date(Date.now() + n * mult[m[2]]);
}
