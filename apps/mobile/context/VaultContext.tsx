import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
} from '@vault/core';
import { mobileStorage } from '../storage/ExpoStorageAdapter';

const BIO_KEY_STORAGE = 'vault_manager:bio_key';

interface VaultContextType {
  isUnlocked: boolean;
  vaultExists: boolean;
  vault: Vault | null;
  isLoading: boolean;
  error: string | null;
  hasBiometrics: boolean;
  createVault: (password: string) => Promise<void>;
  unlockVault: (password: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  enableBiometrics: (password: string) => Promise<boolean>;
  lock: () => void;
  addEntry: (entry: Omit<VaultEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<Omit<VaultEntry, 'id' | 'createdAt'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleFav: (id: string) => Promise<void>;
  importVaultFile: (encryptedJsonStr: string, password: string) => Promise<boolean>;
}

const VaultContext = createContext<VaultContextType | null>(null);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [vaultExists, setVaultExists] = useState(false);
  const [vault, setVault] = useState<Vault | null>(null);
  const [currentKey, setCurrentKey] = useState<CryptoKey | null>(null);
  const [currentSalt, setCurrentSalt] = useState<Uint8Array | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  // Check initial vault existence & biometric support
  useEffect(() => {
    async function init() {
      try {
        const exists = await mobileStorage.exists(STORAGE_KEYS.VAULT);
        setVaultExists(exists);

        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(hasHardware && isEnrolled);
      } catch (err) {
        console.error('Init error', err);
      } finally {
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
  }, []);

  const createVault = async (password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { encryptedFile, key, salt } = await createVaultCore(password);
      await mobileStorage.write(STORAGE_KEYS.VAULT, JSON.stringify(encryptedFile));
      
      const { vault: openedVault } = await openVaultCore(encryptedFile, password);
      setVault(openedVault);
      setCurrentKey(key);
      setCurrentSalt(salt);
      setVaultExists(true);
      setIsUnlocked(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create vault');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const unlockVault = async (password: string): Promise<boolean> => {
    setIsLoading(true);
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
    } catch (err: any) {
      setError('Invalid Master Password');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const enableBiometrics = async (password: string): Promise<boolean> => {
    try {
      const raw = await mobileStorage.read(STORAGE_KEYS.VAULT);
      if (!raw) return false;

      await SecureStore.setItemAsync(BIO_KEY_STORAGE, password, {
        requireAuthentication: true,
      });
      return true;
    } catch {
      return false;
    }
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Vault Manager',
        fallbackLabel: 'Use Master Password',
      });

      if (result.success) {
        const storedPass = await SecureStore.getItemAsync(BIO_KEY_STORAGE);
        if (storedPass) {
          return await unlockVault(storedPass);
        }
      }
      return false;
    } catch {
      return false;
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

  const importVaultFile = async (encryptedJsonStr: string, password: string): Promise<boolean> => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VaultContext.Provider
      value={{
        isUnlocked,
        vaultExists,
        vault,
        isLoading,
        error,
        hasBiometrics,
        createVault,
        unlockVault,
        unlockWithBiometrics,
        enableBiometrics,
        lock,
        addEntry,
        updateEntry,
        deleteEntry,
        toggleFav,
        importVaultFile,
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
