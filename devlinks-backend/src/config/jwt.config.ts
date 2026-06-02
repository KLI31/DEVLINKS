export const jwtConfig = {
  expiresIn: process.env.JWT_EXPIRES_IN ?? process.env.JWT_EXPIRY ?? '15m',
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRY ?? '7d',
};

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
