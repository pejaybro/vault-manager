import { Platform, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { Vault, PasswordData, getEntriesByType } from '@vault/core';

export interface AutofillMatch {
  id: string;
  name: string;
  username: string;
  password: string;
}

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
