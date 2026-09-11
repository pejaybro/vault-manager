import * as SecureStore from 'expo-secure-store';
import { StorageAdapter } from '@vault/core';

export class ExpoStorageAdapter implements StorageAdapter {
  async read(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  async write(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  async delete(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = await this.read(key);
    return item !== null;
  }
}

export const mobileStorage = new ExpoStorageAdapter();
