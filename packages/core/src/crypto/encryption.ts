// ============================================================
// ENCRYPTION — AES-256-GCM
// Encrypts and decrypts vault data using Web Crypto API
// ============================================================

import { EncryptedVaultFile, Vault } from '../models';
import { uint8ToBase64, base64ToUint8 } from './keyDerivation';

const IV_LENGTH = 12; // 96 bits for AES-GCM

/**
 * Encrypt a plaintext string with AES-256-GCM
 */
export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<{ iv: string; data: string }> {
  const encoder = new TextEncoder();
  const iv = new Uint8Array(IV_LENGTH);
  crypto.getRandomValues(iv);

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    iv: uint8ToBase64(iv),
    data: uint8ToBase64(new Uint8Array(cipherBuffer)),
  };
}

/**
 * Decrypt an AES-256-GCM encrypted payload
 */
export async function decrypt(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const decoder = new TextDecoder();

  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToUint8(iv) as any },
    key,
    base64ToUint8(encryptedData) as any
  );

  return decoder.decode(plainBuffer);
}

/**
 * Encrypt an entire Vault object into an EncryptedVaultFile
 */
export async function encryptVault(
  vault: Vault,
  key: CryptoKey,
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
  key: CryptoKey
): Promise<Vault> {
  const plaintext = await decrypt(file.data, file.iv, key);
  return JSON.parse(plaintext) as Vault;
}

/**
 * Compute a SHA-256 checksum of a string (for export verification)
 */
export async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return uint8ToBase64(new Uint8Array(hashBuffer));
}
