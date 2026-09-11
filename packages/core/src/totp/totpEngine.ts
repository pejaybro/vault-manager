// ============================================================
// TOTP ENGINE — RFC 6238
// Generates time-based one-time passwords (like Google Authenticator)
// Pure-JS implementation using Web Crypto API (no Node.js crypto)
// ============================================================

import type { TOTPData } from '../models';

// --- Base32 Decoder (RFC 4648) ---

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(input: string): Uint8Array {
  const cleaned = input.replace(/[\s=]+/g, '').toUpperCase();
  const output: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;

  for (const char of cleaned) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) throw new Error(`Invalid Base32 character: ${char}`);
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      bitsLeft -= 8;
      output.push((buffer >> bitsLeft) & 0xff);
    }
  }

  return new Uint8Array(output);
}

function getCrypto(): Crypto {
  const c = (typeof globalThis !== 'undefined' && globalThis.crypto) ||
            (typeof window !== 'undefined' && window.crypto) ||
            (typeof globalThis !== 'undefined' && (globalThis as any).crypto);
  if (!c) throw new Error('Web Crypto API is unavailable. Polyfill required.');
  return c;
}

// --- HMAC computation via Web Crypto ---

async function hmacSha(
  algorithm: string,
  key: Uint8Array,
  message: Uint8Array
): Promise<Uint8Array> {
  // Map algorithm names to Web Crypto hash names
  const hashName =
    algorithm === 'SHA256' ? 'SHA-256' :
    algorithm === 'SHA512' ? 'SHA-512' :
    'SHA-1'; // default SHA1

  const cryptoKey = await getCrypto().subtle.importKey(
    'raw',
    key as any,
    { name: 'HMAC', hash: { name: hashName } },
    false,
    ['sign']
  );

  const signature = await getCrypto().subtle.sign('HMAC', cryptoKey, message as any);
  return new Uint8Array(signature);
}

// --- HOTP dynamic truncation (RFC 4226 §5.4) ---

function dynamicTruncate(hmacResult: Uint8Array, digits: number): string {
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const otp = code % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

// --- Counter encoding ---

function intToBytes(num: number): Uint8Array {
  const bytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    bytes[i] = num & 0xff;
    num = Math.floor(num / 256);
  }
  return bytes;
}

// --- Public API ---

/**
 * Generate a TOTP code for a given secret (async — uses Web Crypto)
 */
export async function generateTOTP(
  secret: string,
  period = 30,
  digits = 6,
  algorithm = 'SHA1'
): Promise<string> {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / period);
  const counterBytes = intToBytes(counter);
  const hmac = await hmacSha(algorithm, key, counterBytes);
  return dynamicTruncate(hmac, digits);
}

/**
 * Get seconds remaining until the next code rotation
 */
export function getTimeRemaining(period = 30): number {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

/**
 * Get progress from 0 to 1 (1 = fresh code, 0 = about to expire)
 */
export function getProgress(period = 30): number {
  return getTimeRemaining(period) / period;
}

/**
 * Validate a Base32 TOTP secret
 */
export async function validateSecret(secret: string): Promise<boolean> {
  if (!secret || typeof secret !== 'string') return false;
  const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z2-7=]+$/.test(cleanSecret)) return false;
  try {
    await generateTOTP(cleanSecret);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse an otpauth:// URI into TOTPData
 * e.g. otpauth://totp/GitHub:user@email.com?secret=ABC&issuer=GitHub
 */
export function parseTOTPUri(uri: string): Omit<TOTPData, 'id'> | null {
  try {
    const url = new URL(uri);
    if (url.protocol !== 'otpauth:') return null;

    const label = decodeURIComponent(url.pathname.slice(1)); // remove leading /
    const [issuerFromLabel, account] = label.includes(':')
      ? label.split(':')
      : ['', label];

    const params = url.searchParams;
    const secret = params.get('secret') ?? '';
    const issuer = params.get('issuer') ?? issuerFromLabel ?? '';
    const algorithm = (params.get('algorithm') ?? 'SHA1') as TOTPData['algorithm'];
    const digits = parseInt(params.get('digits') ?? '6', 10) as 6 | 8;
    const period = parseInt(params.get('period') ?? '30', 10) as 30 | 60;

    return { secret, issuer, account: account.trim(), algorithm, digits, period };
  } catch {
    return null;
  }
}

/**
 * Format a 6-digit code as "123 456" for readability
 */
export function formatCode(code: string): string {
  if (code.length === 6) return `${code.slice(0, 3)} ${code.slice(3)}`;
  if (code.length === 8) return `${code.slice(0, 4)} ${code.slice(4)}`;
  return code;
}
