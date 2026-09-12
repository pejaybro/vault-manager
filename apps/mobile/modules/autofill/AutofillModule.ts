import { Platform, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { File, Paths } from 'expo-file-system';
import { Vault, PasswordData, getEntriesByType } from '@vault/core';

export interface AutofillMatch {
  id: string;
  name: string;
  username: string;
  password: string;
}

export interface PendingAutofillSave {
  name: string;
  username: string;
  password: string;
  url?: string;
  timestamp: number;
}

const CREDENTIALS_FILENAME = 'autofill_credentials.json';
const PENDING_SAVE_FILENAME = 'autofill_pending_save.json';

export class AutofillModule {
  /**
   * Open Android System Settings directly for Autofill Service Selection
   */
  static async openAutofillSettings(): Promise<void> {
    if (Platform.OS === 'android') {
      try {
        // Try launching Android's direct Autofill Service selection prompt
        await IntentLauncher.startActivityAsync('android.settings.REQUEST_SET_AUTOFILL_SERVICE', {
          data: 'package:com.vaultmanager.app',
        });
      } catch {
        try {
          // Fallback to general OS Autofill settings screen (Samsung / Android 8.0+)
          await IntentLauncher.startActivityAsync('android.settings.AUTOFILL_SETTINGS');
        } catch {
          // Fallback to app settings
          Linking.openSettings();
        }
      }
    }
  }

  /**
   * Sync active decrypted vault credentials to the native autofill cache file.
   * This is read by AutofillService.java when other apps request autofill.
   */
  static async syncCredentialsToAutofill(vault: Vault | null): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      const file = new File(Paths.document, CREDENTIALS_FILENAME);
      if (!vault) {
        if (file.exists) {
          await file.write('[]');
        }
        return;
      }

      const passwords = getEntriesByType(vault, 'password');
      const payload = passwords.map((entry) => {
        const data = entry.data as PasswordData;
        return {
          id: entry.id,
          name: entry.name,
          username: data.username || '',
          password: data.password,
          url: data.url || '',
        };
      });

      await file.write(JSON.stringify(payload));
    } catch (err) {
      console.warn('AutofillModule.syncCredentialsToAutofill error:', err);
    }
  }

  /**
   * Read any pending saves captured by Android AutofillService.java onSaveRequest
   */
  static async getPendingSaves(): Promise<PendingAutofillSave[]> {
    if (Platform.OS !== 'android') return [];

    try {
      const file = new File(Paths.document, PENDING_SAVE_FILENAME);
      if (!file.exists) return [];
      const content = await file.text();
      const list = JSON.parse(content || '[]');
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear pending saves after they have been processed and merged into the vault
   */
  static async clearPendingSaves(): Promise<void> {
    if (Platform.OS !== 'android') return;

    try {
      const file = new File(Paths.document, PENDING_SAVE_FILENAME);
      if (file.exists) {
        await file.write('[]');
      }
    } catch (err) {
      console.warn('AutofillModule.clearPendingSaves error:', err);
    }
  }

  /**
   * Find matching password credentials for a target app package or domain
   */
  static findMatchingCredentials(vault: Vault | null, targetQuery: string): AutofillMatch[] {
    if (!vault || !targetQuery) return [];

    const query = targetQuery.toLowerCase().trim();
    const passwords = getEntriesByType(vault, 'password');

    return passwords
      .filter((entry) => {
        const data = entry.data as PasswordData;
        const nameMatch = entry.name.toLowerCase().includes(query);
        const urlMatch = data.url ? data.url.toLowerCase().includes(query) : false;
        return nameMatch || urlMatch;
      })
      .map((entry) => {
        const data = entry.data as PasswordData;
        return {
          id: entry.id,
          name: entry.name,
          username: data.username,
          password: data.password,
        };
      });
  }
}
