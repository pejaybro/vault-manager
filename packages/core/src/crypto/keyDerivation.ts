// ============================================================
// KEY DERIVATION — PBKDF2 (SHA-256)
// Derives a 256-bit AES key from the master password
// Pure JavaScript using @noble/hashes — runs everywhere (mobile, desktop, web)
// ============================================================

import { pbkdf2 } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/hashes/utils.js';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

/**
 * Generate a cryptographically random salt (16 bytes)
 */
export function generateSalt(): Uint8Array {
  return randomBytes(16);
}

/**
 * Derive an AES-256-GCM key (32 bytes) from a master password using PBKDF2-SHA256
 */
export async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Native WebCrypto keeps the KDF off the JS thread on supported runtimes.
  // Fall back to the portable implementation for environments without SubtleCrypto.
  if (globalThis.crypto?.subtle) {
    const keyMaterial = await globalThis.crypto.subtle.importKey(
      'raw',
      toArrayBuffer(passwordBuffer),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const derivedBits = await globalThis.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: toArrayBuffer(salt),
        iterations: 100_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );
    return new Uint8Array(derivedBits);
  }

  // 100,000 iterations PBKDF2-SHA256, 32 bytes output.
  return pbkdf2(sha256, passwordBuffer, salt, { c: 100_000, dkLen: 32 });
}

/**
 * Encode Uint8Array to base64 string
 */
export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode base64 string to Uint8Array
 */
export function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
