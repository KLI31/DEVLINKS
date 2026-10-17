import { BadRequestException } from '@nestjs/common';
import { assertSafeUrl } from './url-validator';

const MAX_REDIRECTS = 3;
const MAX_BYTES = 512 * 1024;
const TIMEOUT_MS = 5000;

async function readLimited(response: Response): Promise<string> {
  if (!response.body) return '';

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new BadRequestException({ error: 'Failed to fetch' });
      }

      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks).toString('utf8');
}

export async function fetchHtmlSafely(urlString: string): Promise<string> {
  let currentUrl = urlString;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertSafeUrl(currentUrl);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        headers: {
          'User-Agent': 'DevLinksBot/1.0 (+https://devlinks.nova11labs.dev)',
        },
        redirect: 'manual',
        signal: controller.signal,
      });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location) {
          throw new BadRequestException({ error: 'Failed to fetch' });
        }
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      if (!response.ok) {
        await response.body?.cancel();
        throw new BadRequestException({ error: 'Failed to fetch' });
      }

      const contentType = response.headers.get('content-type') ?? '';
      if (
        contentType &&
        !/text\/html|application\/xhtml\+xml/i.test(contentType)
      ) {
        await response.body?.cancel();
        throw new BadRequestException({ error: 'Failed to fetch' });
      }

      const declaredLength = Number(
        response.headers.get('content-length') ?? '0',
      );
      if (Number.isFinite(declaredLength) && declaredLength > MAX_BYTES) {
        await response.body?.cancel();
        throw new BadRequestException({ error: 'Failed to fetch' });
      }

      return await readLimited(response);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException({ error: 'Failed to fetch' });
    } finally {
      clearTimeout(timer);
    }
  }

  throw new BadRequestException({ error: 'Failed to fetch' });
}
