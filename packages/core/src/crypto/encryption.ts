// ============================================================
// ENCRYPTION — AES-256-GCM
// Encrypts and decrypts vault data using pure JavaScript @noble/ciphers & @noble/hashes
// ============================================================

import { gcm } from '@noble/ciphers/aes.js';
import { sha256 as nobleSha256 } from '@noble/hashes/sha2.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { EncryptedVaultFile, Vault } from '../models';
import { uint8ToBase64, base64ToUint8 } from './keyDerivation';

const IV_LENGTH = 12; // 96 bits for AES-GCM

function toUint8(k: Uint8Array | CryptoKey): Uint8Array {
  if (k instanceof Uint8Array) return k;
  return new Uint8Array(k as any);
}

/**
 * Encrypt a plaintext string with AES-256-GCM
 */
export async function encrypt(
  plaintext: string,
  key: Uint8Array | CryptoKey
): Promise<{ iv: string; data: string }> {
  const encoder = new TextEncoder();
  const iv = randomBytes(IV_LENGTH);
  const keyBytes = toUint8(key);
  const cipher = gcm(keyBytes, iv);
  const cipherBytes = cipher.encrypt(encoder.encode(plaintext));

  return {
    iv: uint8ToBase64(iv),
    data: uint8ToBase64(cipherBytes),
  };
}

/**
 * Decrypt an AES-256-GCM encrypted payload
 */
export async function decrypt(
  encryptedData: string,
  iv: string,
  key: Uint8Array | CryptoKey
): Promise<string> {
  const decoder = new TextDecoder();
  const keyBytes = toUint8(key);
  const ivBytes = base64ToUint8(iv);
  const dataBytes = base64ToUint8(encryptedData);
  const cipher = gcm(keyBytes, ivBytes);
  const plainBytes = cipher.decrypt(dataBytes);

  return decoder.decode(plainBytes);
}

/**
 * Encrypt an entire Vault object into an EncryptedVaultFile
 */
export async function encryptVault(
  vault: Vault,
  key: Uint8Array | CryptoKey,
  salt: Uint8Array
): Promise<EncryptedVaultFile> {
  const { iv, data } = await encrypt(JSON.stringify(vault), key);
  return {
    v: 1,
    salt: uint8ToBase64(salt),
    iv,
    data,
  };
}

/**
 * Decrypt an EncryptedVaultFile back into a Vault object
 */
export async function decryptVault(
  file: EncryptedVaultFile,
  key: Uint8Array | CryptoKey
): Promise<Vault> {
  const plaintext = await decrypt(file.data, file.iv, key);
  return JSON.parse(plaintext) as Vault;
}

/**
 * Compute a SHA-256 checksum of a string (for export verification)
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = nobleSha256(encoder.encode(input));
  return uint8ToBase64(hash);
}
