import { Platform, Linking } from 'react-native';
import { Vault, PasswordData, getEntriesByType } from '@vault/core';

export interface AutofillMatch {
  id: string;
  name: string;
  username: string;
  password: string;
}

export class AutofillModule {
  /**
   * Open Android System Settings for Autofill Service
   */
  static openAutofillSettings(): void {
    if (Platform.OS === 'android') {
      Linking.openSettings();
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
