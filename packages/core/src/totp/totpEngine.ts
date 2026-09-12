// ============================================================
// TOTP ENGINE — RFC 6238
// Generates time-based one-time passwords (like Google Authenticator)
// Pure-JS implementation using @noble/hashes (no Node.js crypto, no Web Crypto requirement)
// ============================================================

import { hmac } from '@noble/hashes/hmac.js';
import { sha1 } from '@noble/hashes/legacy.js';
import { sha256, sha512 } from '@noble/hashes/sha2.js';
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

// --- HMAC computation via @noble/hashes ---

async function hmacSha(
  algorithm: string,
  key: Uint8Array,
  message: Uint8Array
): Promise<Uint8Array> {
  const hashFn =
    algorithm === 'SHA256' ? sha256 :
    algorithm === 'SHA512' ? sha512 :
    sha1; // default SHA1

  return hmac(hashFn, key, message);
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
 * Generate a TOTP code for a given secret (async — uses @noble/hashes)
 */
export async function generateTOTP(
  secret: string,
  period = 30,
  digits = 6,
  algorithm = 'SHA1'
): Promise<string> {
  const key = base32Decode(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / period);
  const counterBytes = intToBytes(counter);

  const hmacResult = await hmacSha(algorithm, key, counterBytes);
  return dynamicTruncate(hmacResult, digits);
}

/**
 * Format TOTP code with a space in the middle for readability (e.g. "123 456" or "1234 5678")
 */
export function formatCode(code: string): string {
  const mid = Math.floor(code.length / 2);
  return `${code.slice(0, mid)} ${code.slice(mid)}`;
}

/**
 * Get seconds remaining in the current TOTP window
 */
export function getTimeRemaining(period = 30): number {
  const epoch = Math.floor(Date.now() / 1000);
  return period - (epoch % period);
}

/**
 * Get progress as a fraction from 0 to 1 (for countdown rings)
 */
export function getProgress(period = 30): number {
  return getTimeRemaining(period) / period;
}

/**
 * Validate a Base32 secret
 */
export function validateSecret(secret: string): boolean {
  try {
    const decoded = base32Decode(secret);
    return decoded.length >= 10; // Minimum 80 bits recommended
  } catch {
    return false;
  }
}

/**
 * Parse an otpauth:// TOTP URI into TOTPData
 * e.g. otpauth://totp/GitHub:user@email.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub
 */
export function parseTOTPUri(uri: string): Partial<TOTPData> {
  const url = new URL(uri);
  if (url.protocol !== 'otpauth:') {
    throw new Error('Invalid TOTP URI protocol — must be otpauth://');
  }
  if (url.host !== 'totp') {
    throw new Error('Only TOTP (not HOTP) is supported');
  }

  const label = decodeURIComponent(url.pathname.replace(/^\//, ''));
  const parts = label.split(':');
  const issuerFromLabel = parts.length > 1 ? parts[0].trim() : '';
  const account = (parts.length > 1 ? parts[1] : parts[0]).trim();

  const params = url.searchParams;
  const secret = params.get('secret') || '';
  const issuer = params.get('issuer') || issuerFromLabel;
  const algorithm = (params.get('algorithm') || 'SHA1').toUpperCase() as any;
  const digits = parseInt(params.get('digits') || '6', 10) as 6 | 8;
  const period = parseInt(params.get('period') || '30', 10) as 30 | 60;

  if (!secret) throw new Error('TOTP URI missing required "secret" parameter');

  return {
    secret,
    issuer,
    account,
    algorithm,
    digits,
    period,
  };
}
