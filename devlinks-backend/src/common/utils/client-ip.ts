import { isIP } from 'node:net';
import type { Request } from 'express';

export function normalizeIp(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  let ip = value.trim();
  if (!ip) return null;

  if (ip.startsWith('[') && ip.endsWith(']')) {
    ip = ip.slice(1, -1);
  }

  const zoneIndex = ip.indexOf('%');
  if (zoneIndex !== -1) {
    ip = ip.slice(0, zoneIndex);
  }

  if (isIP(ip) === 0) return null;

  if (isIP(ip) === 6) {
    const lower = ip.toLowerCase();
    if (lower.startsWith('::ffff:')) {
      const mapped = lower.slice(7);
      if (isIP(mapped) === 4) return mapped;
    }
  }

  return ip;
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (
    parts.length !== 4 ||
    parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)
  ) {
    return true;
  }

  const [a, b, c] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();

  if (lower === '::' || lower === '::1') return true;

  if (lower.startsWith('::ffff:')) {
    const mapped = lower.slice(7);
    if (isIP(mapped) === 4) return isPrivateIpv4(mapped);

    const hexParts = mapped.split(':');
    if (hexParts.length === 2) {
      const high = Number.parseInt(hexParts[0], 16);
      const low = Number.parseInt(hexParts[1], 16);
      if (Number.isInteger(high) && Number.isInteger(low)) {
        const ipv4 = `${(high >> 8) & 255}.${high & 255}.${(low >> 8) & 255}.${low & 255}`;
        return isPrivateIpv4(ipv4);
      }
    }
  }

  if (/^f[cd][0-9a-f]{2}:/.test(lower)) return true;
  if (/^fe[89ab][0-9a-f]:/.test(lower)) return true;
  if (/^ff[0-9a-f]{2}:/.test(lower)) return true;

  return false;
}

export function isPrivateIp(ip: string): boolean {
  const normalized = normalizeIp(ip);
  if (!normalized) return true;

  const version = isIP(normalized);
  if (version === 4) return isPrivateIpv4(normalized);
  if (version === 6) return isPrivateIpv6(normalized);

  return true;
}

export function isPublicIp(ip: string): boolean {
  const normalized = normalizeIp(ip);
  return normalized !== null && !isPrivateIp(normalized);
}

export function isTrustedProxy(ip: string): boolean {
  return isPrivateIp(ip);
}

export function getClientIp(req: Request): string {
  const direct = normalizeIp(req.ip);
  if (direct && !isPrivateIp(direct)) return direct;

  const forwarded = normalizeIp(req.headers['x-client-ip']);
  if (forwarded && !isPrivateIp(forwarded)) return forwarded;

  const socket = normalizeIp(req.socket?.remoteAddress);
  return direct ?? socket ?? '127.0.0.1';
}
