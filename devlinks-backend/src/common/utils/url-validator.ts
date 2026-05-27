import { BadRequestException } from '@nestjs/common';

const BLOCKED_HOSTNAMES = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/, // link-local / AWS metadata
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fe[89ab][0-9a-f]:/i,
  /^metadata\.google\.internal$/i,
];

export function assertSafeUrl(urlString: string): void {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new BadRequestException('URL inválida');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new BadRequestException('Solo se permiten URLs http o https');
  }

  const hostname = url.hostname.toLowerCase();

  for (const pattern of BLOCKED_HOSTNAMES) {
    if (pattern.test(hostname)) {
      throw new BadRequestException('URL no permitida');
    }
  }
}
