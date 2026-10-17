import { BadRequestException } from '@nestjs/common';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { isPublicIp } from './client-ip';

const BLOCKED_HOSTNAME_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.home.arpa',
];

function stripBrackets(hostname: string): string {
  return hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;
}

export async function assertSafeUrl(urlString: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new BadRequestException('URL inválida');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new BadRequestException('Solo se permiten URLs http o https');
  }

  if (url.username || url.password) {
    throw new BadRequestException('URL no permitida');
  }

  const hostname = stripBrackets(url.hostname).toLowerCase();

  if (!hostname) {
    throw new BadRequestException('URL no permitida');
  }

  if (
    hostname === 'localhost' ||
    BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new BadRequestException('URL no permitida');
  }

  if (isIP(hostname) !== 0) {
    if (!isPublicIp(hostname)) {
      throw new BadRequestException('URL no permitida');
    }
    return url;
  }

  let addresses: { address: string }[];
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new BadRequestException('URL no permitida');
  }

  if (
    addresses.length === 0 ||
    addresses.some((entry) => !isPublicIp(entry.address))
  ) {
    throw new BadRequestException('URL no permitida');
  }

  return url;
}
