// ============================================================
// VAULT MANAGER — CRUD Operations
// All operations on the vault (add, update, delete, search)
// ============================================================

import { customAlphabet } from 'nanoid';
import {
  Vault,
  VaultEntry,
  VaultMeta,
  EncryptedVaultFile,
  EntryType,
} from '../models';
import { generateSalt, deriveKey, uint8ToBase64, base64ToUint8 } from '../crypto/keyDerivation';
import { encryptVault, decryptVault } from '../crypto/encryption';
import type { StorageAdapter } from './storage';
import { STORAGE_KEYS } from './storage';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 21);

// --- Vault Lifecycle ---

/**
 * Create a brand new empty vault from a master password
 * Returns the encrypted file string to persist
 */
export async function createNewVault(
  masterPassword: string
): Promise<{ encryptedFile: EncryptedVaultFile; key: CryptoKey; salt: Uint8Array }> {
  const salt = generateSalt();
  const key = await deriveKey(masterPassword, salt);

  const vault: Vault = {
    version: 1,
    meta: {
      createdAt: Date.now(),
      deviceId: nanoid(),
      lastModified: Date.now(),
      version: 1,
    },
    entries: [],
  };

  const encryptedFile = await encryptVault(vault, key, salt);
  return { encryptedFile, key, salt };
}

/**
 * Open an existing vault with a master password
 */
export async function openVault(
  encryptedFile: EncryptedVaultFile,
  masterPassword: string
): Promise<{ vault: Vault; key: CryptoKey }> {
  const salt = base64ToUint8(encryptedFile.salt);
  const key = await deriveKey(masterPassword, salt);
  const vault = await decryptVault(encryptedFile, key);
  return { vault, key };
}

/**
 * Save vault back to storage (re-encrypts with same key)
 */
export async function saveVault(
  vault: Vault,
  key: CryptoKey,
  salt: Uint8Array,
  storage: StorageAdapter
): Promise<void> {
  const updated: Vault = {
    ...vault,
    meta: { ...vault.meta, lastModified: Date.now() },
  };
  const encrypted = await encryptVault(updated, key, salt);
  await storage.write(STORAGE_KEYS.VAULT, JSON.stringify(encrypted));
}

// --- Entry CRUD ---

/**
 * Add a new entry to the vault
 */
export function addEntry(
  vault: Vault,
  entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>
): { vault: Vault; id: string } {
  const id = nanoid();
  const now = Date.now();
  const newEntry: VaultEntry = { ...entry, id, createdAt: now, updatedAt: now };
  return {
    vault: { ...vault, entries: [...vault.entries, newEntry] },
    id,
  };
}

/**
 * Update an existing entry by ID
 */
export function updateEntry(
  vault: Vault,
  id: string,
  updates: Partial<Omit<VaultEntry, 'id' | 'createdAt'>>
): Vault {
  return {
    ...vault,
    entries: vault.entries.map((e) =>
      e.id === id ? { ...e, ...updates, updatedAt: Date.now() } : e
    ),
  };
}

/**
 * Delete an entry by ID
 */
export function deleteEntry(vault: Vault, id: string): Vault {
  return {
    ...vault,
    entries: vault.entries.filter((e) => e.id !== id),
  };
}

/**
 * Get a single entry by ID
 */
export function getEntry(vault: Vault, id: string): VaultEntry | undefined {
  return vault.entries.find((e) => e.id === id);
}

/**
 * Get all entries of a specific type
 */
export function getEntriesByType(vault: Vault, type: EntryType): VaultEntry[] {
  return vault.entries.filter((e) => e.type === type);
}

/**
 * Search entries by name, across all types
 */
export function searchEntries(vault: Vault, query: string): VaultEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return vault.entries;
  return vault.entries.filter((e) =>
    e.name.toLowerCase().includes(q)
  );
}

/**
 * Toggle favourite on an entry
 */
export function toggleFavourite(vault: Vault, id: string): Vault {
  return {
    ...vault,
    entries: vault.entries.map((e) =>
      e.id === id ? { ...e, favourite: !e.favourite, updatedAt: Date.now() } : e
    ),
  };
}

// --- Merge ---

/**
 * Merge two vaults — newer updatedAt wins on conflict
 */
export function mergeVaults(base: Vault, incoming: Vault): Vault {
  const merged = new Map<string, VaultEntry>();

  for (const entry of base.entries) merged.set(entry.id, entry);
  for (const entry of incoming.entries) {
    const existing = merged.get(entry.id);
    if (!existing || entry.updatedAt > existing.updatedAt) {
      merged.set(entry.id, entry);
    }
  }

  return {
    ...base,
    entries: Array.from(merged.values()),
    meta: {
      ...base.meta,
      lastModified: Date.now(),
    },
  };
}
