import * as crypto from 'crypto';
import geoip from 'geoip-lite';

export interface GeoResult {
  city: string | null;
  country: string | null;
  countryCode: string | null;
  formatted: string | null;
}

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export function lookupIp(rawIp: string): GeoResult {
  const ip = cleanIp(rawIp);

  if (isPrivateOrLoopback(ip)) {
    return { city: null, country: null, countryCode: null, formatted: null };
  }

  const lookup = geoip.lookup(ip);
  if (!lookup) {
    return { city: null, country: null, countryCode: null, formatted: null };
  }

  const city = lookup.city || null;
  const countryCode = lookup.country || null;
  const country = countryCode
    ? (new Intl.DisplayNames(['es'], { type: 'region' }).of(countryCode) ??
      null)
    : null;

  const formatted =
    city && country ? `${city}, ${country}` : (city ?? country ?? null);

  return { city, country, countryCode, formatted };
}

function cleanIp(rawIp: string): string {
  const trimmed = rawIp.trim();
  const first = trimmed.split(',')[0];
  return first.trim();
}

function isPrivateOrLoopback(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return true;
  }

  const parts = ip.split('.');
  if (parts.length === 4) {
    const [a, b] = parts.map(Number);
    if (
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254)
    ) {
      return true;
    }
  }

  return false;
}
