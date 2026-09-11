// ============================================================
// DATA MODELS — Vault Manager
// All TypeScript interfaces shared across mobile and desktop
// ============================================================

// --- Entry Types ---

export type EntryType = 'password' | 'totp' | 'key' | 'note';

export type KeyType =
  | 'api_key'
  | 'ssh_key'
  | 'certificate'
  | 'token'
  | 'note'
  | 'other';

export type Category =
  | 'social'
  | 'banking'
  | 'work'
  | 'shopping'
  | 'email'
  | 'other';

export type TOTPAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';

// --- Entry Data Shapes ---

export interface PasswordData {
  username: string;
  password: string;
  url?: string;
  category: Category;
  notes?: string;
  passwordHistory?: string[]; // last 3 passwords
}

export interface TOTPData {
  secret: string;       // Base32 encoded secret
  issuer: string;       // e.g. "GitHub"
  account: string;      // e.g. "user@email.com"
  algorithm: TOTPAlgorithm;
  digits: 6 | 8;
  period: 30 | 60;      // seconds
}

export interface KeyData {
  keyType: KeyType;
  keyValue: string;
  description?: string;
  tags?: string[];
  expiresAt?: number;   // unix timestamp, optional
}

export interface NoteData {
  content: string;
  tags?: string[];
}

// --- Vault Entry ---

export interface VaultEntry {
  id: string;
  type: EntryType;
  name: string;
  createdAt: number;    // unix timestamp
  updatedAt: number;    // unix timestamp
  favourite: boolean;
  data: PasswordData | TOTPData | KeyData | NoteData;
}

// --- Vault ---

export interface VaultMeta {
  createdAt: number;
  deviceId: string;
  lastModified: number;
  version: number;
}

export interface Vault {
  version: 1;
  meta: VaultMeta;
  entries: VaultEntry[];
}

// --- Encrypted Vault File (stored on disk) ---

export interface EncryptedVaultFile {
  v: 1;             // format version
  salt: string;     // base64 — Argon2 salt
  iv: string;       // base64 — AES-GCM iv
  data: string;     // base64 — encrypted vault JSON
}

// --- Storage Adapter Interface ---

export interface StorageAdapter {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// --- Session ---

export interface VaultSession {
  vault: Vault;
  key: CryptoKey;
  lockedAt?: number;
}

// --- Sync / Export ---

export interface VaultExportPayload {
  v: 1;
  type: 'vault_export';
  salt: string;
  iv: string;
  data: string;
  checksum: string;   // SHA-256 of data
  exportedAt: number;
}
