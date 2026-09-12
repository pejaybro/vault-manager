import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import {
  Vault,
  VaultEntry,
  createNewVault as createVaultCore,
  openVault as openVaultCore,
  saveVault as saveVaultCore,
  addEntry as addEntryCore,
  updateEntry as updateEntryCore,
  deleteEntry as deleteEntryCore,
  toggleFavourite as toggleFavCore,
  STORAGE_KEYS,
  base64ToUint8,
  PasswordData,
} from '@vault/core';
import { mobileStorage } from '../storage/ExpoStorageAdapter';

const BIO_KEY_STORAGE = 'vault_manager_bio_key';

interface VaultContextType {
  isUnlocked: boolean;
  vaultExists: boolean;
  vault: Vault | null;
  isLoading: boolean;
  isBiometricLoading: boolean;
  error: string | null;
  hasBiometrics: boolean;
  isBiometricsEnabled: boolean;
  createVault: (password: string) => Promise<void>;
  unlockVault: (password: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  enableBiometrics: (password: string) => Promise<boolean>;
  disableBiometrics: () => Promise<void>;
  lock: () => void;
  addEntry: (entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<VaultEntry, 'id' | 'createdAt'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFav: (id: string) => Promise<void>;
  importVaultFile: (encryptedJsonStr: string, password: string) => Promise<boolean>;
  addCustomCategory: (categoryName: string) => Promise<void>;
  deleteCustomCategory: (categoryName: string) => Promise<{ success: boolean; message?: string }>;
  getCategoryUsageCount: (categoryName: string) => number;
}

const VaultContext = createContext<VaultContextType | null>(null);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [vaultExists, setVaultExists] = useState(false);
  const [vault, setVault] = useState<Vault | null>(null);
  const [currentKey, setCurrentKey] = useState<Uint8Array | CryptoKey | null>(null);
  const [currentSalt, setCurrentSalt] = useState<Uint8Array | null>(null);
  // isLoading = true only during initial vault check — NOT during unlock crypto
  const [isLoading, setIsLoading] = useState(true);
  // isBiometricLoading = true only while biometric prompt + vault open is running
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(false);
  // Prevents double-triggering biometric auto-prompt on remount
  const biometricAttempted = useRef(false);

  // Check initial vault existence & biometric support
  // Keeps isLoading=true until we know vault state — prevents flash
  useEffect(() => {
    async function init() {
      try {
        const exists = await mobileStorage.exists(STORAGE_KEYS.VAULT);
        setVaultExists(exists);

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(hasHardware && isEnrolled);

        try {
          const stored = await SecureStore.getItemAsync(BIO_KEY_STORAGE);
          setIsBiometricsEnabled(Boolean(stored));
        } catch {
          setIsBiometricsEnabled(false);
        }
      } catch (err) {
        console.error('Init error', err);
      } finally {
        // Only unblock router AFTER we know vault state — kills the flash
        setIsLoading(false);
      }
    }
    init();
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    setVault(null);
    setCurrentKey(null);
    setCurrentSalt(null);
    setError(null);
    biometricAttempted.current = false;
  }, []);

  const createVault = async (password: string) => {
    setError(null);
    try {
      const { encryptedFile, key, salt, vault: openedVault } = await createVaultCore(password);
      await mobileStorage.write(STORAGE_KEYS.VAULT, JSON.stringify(encryptedFile));
      setVault(openedVault);
      setCurrentKey(key);
      setCurrentSalt(salt);
      setVaultExists(true);
      setIsUnlocked(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create vault');
      throw err;
    }
  };

  // Password unlock — shows its own button loading state, NOT global isLoading
  const unlockVault = async (password: string): Promise<boolean> => {
    setError(null);
    try {
      const raw = await mobileStorage.read(STORAGE_KEYS.VAULT);
      if (!raw) throw new Error('No vault found');

      const encryptedFile = JSON.parse(raw);
      const { vault: openedVault, key } = await openVaultCore(encryptedFile, password);

      setVault(openedVault);
      setCurrentKey(key);
      setCurrentSalt(base64ToUint8(encryptedFile.salt));
      setIsUnlocked(true);
      return true;
    } catch {
      setError('Invalid Master Password');
      return false;
    }
  };

  const enableBiometrics = async (password: string): Promise<boolean> => {
    try {
      const raw = await mobileStorage.read(STORAGE_KEYS.VAULT);
      if (!raw) return false;

      const encryptedFile = JSON.parse(raw);
      await openVaultCore(encryptedFile, password);
      await SecureStore.setItemAsync(BIO_KEY_STORAGE, password);
      setIsBiometricsEnabled(true);
      return true;
    } catch (err) {
      console.warn('enableBiometrics error', err);
      return false;
    }
  };

  const disableBiometrics = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(BIO_KEY_STORAGE);
    } catch {
      // ignore
    }
    setIsBiometricsEnabled(false);
  };

  // Biometric unlock — uses isBiometricLoading (NOT isLoading) so navigator is not blocked
  const unlockWithBiometrics = async (): Promise<boolean> => {
    if (biometricAttempted.current) return false;
    biometricAttempted.current = true;
    setIsBiometricLoading(true);
    try {
      const storedPass = await SecureStore.getItemAsync(BIO_KEY_STORAGE);
      if (!storedPass) {
        setIsBiometricsEnabled(false);
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: Platform.OS === 'ios' ? 'Use Face ID to unlock Vault Manager' : 'Use fingerprint to unlock Vault Manager',
        fallbackLabel: 'Use Master Password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return await unlockVault(storedPass);
      }
      // User cancelled — allow retry
      biometricAttempted.current = false;
      return false;
    } catch (err) {
      console.warn('unlockWithBiometrics error', err);
      biometricAttempted.current = false;
      return false;
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const persistVault = async (newVault: Vault) => {
    if (!currentKey || !currentSalt) throw new Error('Vault is locked');
    await saveVaultCore(newVault, currentKey, currentSalt, mobileStorage);
    setVault(newVault);
  };

  const addEntry = async (entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!vault) return;
    const { vault: updated } = addEntryCore(vault, entry);
    await persistVault(updated);
  };

  const updateEntry = async (id: string, updates: Partial<Omit<VaultEntry, 'id' | 'createdAt'>>) => {
    if (!vault) return;
    const updated = updateEntryCore(vault, id, updates);
    await persistVault(updated);
  };

  const deleteEntry = async (id: string) => {
    if (!vault) return;
    const updated = deleteEntryCore(vault, id);
    await persistVault(updated);
  };

  const toggleFav = async (id: string) => {
    if (!vault) return;
    const updated = toggleFavCore(vault, id);
    await persistVault(updated);
  };

  const getCategoryUsageCount = (categoryName: string): number => {
    if (!vault) return 0;
    const target = categoryName.toLowerCase();
    return vault.entries.filter((entry) => {
      if (entry.type === 'password') {
        const cat = (entry.data as PasswordData).category;
        return cat && cat.toLowerCase() === target;
      }
      return false;
    }).length;
  };

  const addCustomCategory = async (categoryName: string) => {
    if (!vault) return;
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    const existing = vault.meta.customCategories || [];
    if (existing.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;

    const updated: Vault = {
      ...vault,
      meta: {
        ...vault.meta,
        customCategories: [...existing, trimmed],
        lastModified: Date.now(),
      },
    };
    await persistVault(updated);
  };

  const deleteCustomCategory = async (
    categoryName: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (!vault) return { success: false, message: 'Vault is locked' };
    const trimmed = categoryName.trim();
    const count = getCategoryUsageCount(trimmed);

    if (count > 0) {
      return {
        success: false,
        message: `Cannot delete '${trimmed}'. This category currently contains ${count} saved item(s). Please move or delete the passwords in this category first.`,
      };
    }

    const existing = vault.meta.customCategories || [];
    const filtered = existing.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());

    const updated: Vault = {
      ...vault,
      meta: {
        ...vault.meta,
        customCategories: filtered,
        lastModified: Date.now(),
      },
    };
    await persistVault(updated);
    return { success: true };
  };

  const importVaultFile = async (encryptedJsonStr: string, password: string): Promise<boolean> => {
    try {
      const encryptedFile = JSON.parse(encryptedJsonStr);
      const { vault: importedVault, key } = await openVaultCore(encryptedFile, password);

      await mobileStorage.write(STORAGE_KEYS.VAULT, encryptedJsonStr);
      setVault(importedVault);
      setCurrentKey(key);
      setCurrentSalt(base64ToUint8(encryptedFile.salt));
      setVaultExists(true);
      setIsUnlocked(true);
      return true;
    } catch {
      setError('Failed to import vault file. Invalid password or corrupted file.');
      return false;
    }
  };

  return (
    <VaultContext.Provider
      value={{
        isUnlocked,
        vaultExists,
        vault,
        isLoading,
        isBiometricLoading,
        error,
        hasBiometrics,
        isBiometricsEnabled,
        createVault,
        unlockVault,
        unlockWithBiometrics,
        enableBiometrics,
        disableBiometrics,
        lock,
        addEntry,
        updateEntry,
        deleteEntry,
        toggleFav,
        importVaultFile,
        addCustomCategory,
        deleteCustomCategory,
        getCategoryUsageCount,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) throw new Error('useVault must be used within a VaultProvider');
  return context;
};
