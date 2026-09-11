// ============================================================
// DURESS MODE & DECOY VAULT ENGINE
// Returns fake decoy vault when unlocked with secondary Duress PIN
// ============================================================

import { Vault } from '../models';

export interface DuressConfig {
  enabled: boolean;
  duressPinHash: string; // Hash of duress PIN
}

/**
 * Generate a believable decoy vault for protection under coercion
 */
export function generateDecoyVault(): Vault {
  const now = Date.now();
  return {
    version: 1,
    meta: {
      createdAt: now - 30 * 24 * 60 * 60 * 1000,
      deviceId: 'decoy-device',
      lastModified: now,
      version: 1,
    },
    entries: [
      {
        id: 'decoy-1',
        type: 'password',
        name: 'Personal Email',
        createdAt: now - 30 * 24 * 60 * 60 * 1000,
        updatedAt: now - 15 * 24 * 60 * 60 * 1000,
        favourite: true,
        data: {
          username: 'user.personal@gmail.com',
          password: 'Password123!',
          category: 'email',
        },
      },
      {
        id: 'decoy-2',
        type: 'password',
        name: 'Social Network',
        createdAt: now - 20 * 24 * 60 * 60 * 1000,
        updatedAt: now - 10 * 24 * 60 * 60 * 1000,
        favourite: false,
        data: {
          username: 'my_user_handle',
          password: 'MyDecoyPassword99!',
          category: 'social',
        },
      },
    ],
  };
}
