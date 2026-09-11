import { StorageAdapter } from '@vault/core';

export class TauriStorageAdapter implements StorageAdapter {
  async read(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async write(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async exists(key: string): Promise<boolean> {
    return localStorage.getItem(key) !== null;
  }
}

export const desktopStorage = new TauriStorageAdapter();
