import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

let _cachedKey: Buffer | null = null;

function deriveKey(): Buffer {
  if (_cachedKey) return _cachedKey;
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw?.length) {
    throw new Error('ENCRYPTION_KEY no está definida');
  }
  _cachedKey = createHash('sha256').update(raw, 'utf8').digest();
  return _cachedKey;
}

/**
 * Cifra el token de acceso de GitHub (AES-256-GCM) para guardarlo en BD u otro almacén.
 * Salida: base64(iv || authTag || ciphertext).
 */
export function encryptGitHubToken(plainToken: string): string {
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainToken, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Descifra un valor producido por {@link encryptGitHubToken}.
 */
export function decryptGitHubToken(encryptedBase64: string): string {
  const key = deriveKey();
  const buf = Buffer.from(encryptedBase64, 'base64');
  if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error('Token cifrado inválido');
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
}
