// ============================================================
// STORAGE ADAPTER — Abstract Interface
// Each platform (mobile/desktop) implements this interface
// ============================================================

export interface StorageAdapter {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// Storage keys used across the app
export const STORAGE_KEYS = {
  VAULT: 'vault_manager:vault',
  CONFIG: 'vault_manager:config',
  BIOMETRIC_HINT: 'vault_manager:bio_hint',
} as const;
