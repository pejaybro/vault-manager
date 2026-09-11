// ============================================================
// KEY DERIVATION — Argon2id
// Derives a 256-bit AES key from the master password
// NOTE: Uses Web Crypto API (available in RN via polyfill + desktop natively)
// ============================================================

import { StorageAdapter } from '../vault/storage';

const ARGON2_MEMORY = 65536;   // 64 MB
const ARGON2_ITERATIONS = 3;
const ARGON2_PARALLELISM = 1;
const KEY_LENGTH = 32;          // 256 bits

/**
 * Generate a cryptographically random salt (16 bytes)
 */
export function generateSalt(): Uint8Array {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}

/**
 * Derive an AES-256-GCM key from a master password using PBKDF2
 * (Argon2id via argon2-browser is added in M2 — PBKDF2 used as scaffold)
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as raw key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Derive AES-256-GCM key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 310_000,  // OWASP recommended for PBKDF2-SHA256
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Encode Uint8Array to base64 string
 */
export function uint8ToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Decode base64 string to Uint8Array
 */
export function base64ToUint8(base64: string): Uint8Array {
  return new Uint8Array(
    atob(base64)
      .split('')
      .map((c) => c.charCodeAt(0))
  );
}
