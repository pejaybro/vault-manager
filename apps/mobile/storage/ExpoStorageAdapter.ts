import { File, Paths } from 'expo-file-system';
import { StorageAdapter } from '@vault/core';

export class ExpoStorageAdapter implements StorageAdapter {
  private getFile(key: string): File {
    const sanitized = key.replace(/[^a-zA-Z0-9._-]/g, '_');
    return new File(Paths.document, `${sanitized}.json`);
  }

  async read(key: string): Promise<string | null> {
    try {
      const file = this.getFile(key);
      if (!file.exists) return null;
      return await file.text();
    } catch {
      return null;
    }
  }

  async write(key: string, value: string): Promise<void> {
    const file = this.getFile(key);
    await file.write(value);
  }

  async delete(key: string): Promise<void> {
    try {
      const file = this.getFile(key);
      if (file.exists) {
        await file.delete();
      }
    } catch {
      // ignore
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const file = this.getFile(key);
      return file.exists;
    } catch {
      return false;
    }
  }
}

export const mobileStorage = new ExpoStorageAdapter();
