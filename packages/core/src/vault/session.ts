// ============================================================
// SESSION — In-Memory Vault Session
// Holds the decrypted vault and key in memory while app is unlocked
// Clears on lock
// ============================================================

import { Vault, VaultSession } from '../models';

let _session: VaultSession | null = null;
let _salt: Uint8Array | null = null;

/**
 * Start a session after successful unlock
 */
export function startSession(vault: Vault, key: CryptoKey, salt: Uint8Array): void {
  _session = { vault, key };
  _salt = salt;
}

/**
 * Get the current active session (throws if locked)
 */
export function getSession(): VaultSession {
  if (!_session) throw new Error('Vault is locked');
  return _session;
}

/**
 * Get current salt (needed for re-encrypting on save)
 */
export function getSalt(): Uint8Array {
  if (!_salt) throw new Error('Vault is locked');
  return _salt;
}

/**
 * Update the vault in the current session (after mutations)
 */
export function updateSessionVault(vault: Vault): void {
  if (!_session) throw new Error('Vault is locked');
  _session = { ..._session, vault };
}

/**
 * Lock the vault — wipe key and vault from memory
 */
export function lockVault(): void {
  _session = null;
  _salt = null;
}

/**
 * Check if the vault is currently unlocked
 */
export function isUnlocked(): boolean {
  return _session !== null;
}
