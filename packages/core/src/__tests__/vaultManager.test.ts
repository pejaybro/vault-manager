import { describe, it, expect } from 'vitest';
import {
  createNewVault,
  openVault,
  addEntry,
  updateEntry,
  deleteEntry,
  getEntry,
  getEntriesByType,
  searchEntries,
  toggleFavourite,
  mergeVaults,
} from '../vault/vaultManager';
import { Vault } from '../models';

describe('Vault Manager Operations', () => {
  it('should create and open a new vault', async () => {
    const masterPassword = 'MasterPassword123';
    const { encryptedFile } = await createNewVault(masterPassword);

    expect(encryptedFile.v).toBe(1);
    expect(encryptedFile.salt).toBeDefined();
    expect(encryptedFile.data).toBeDefined();

    const { vault } = await openVault(encryptedFile, masterPassword);
    expect(vault.version).toBe(1);
    expect(vault.entries).toEqual([]);
  });

  it('should perform CRUD operations on vault entries', async () => {
    const { encryptedFile } = await createNewVault('pass123');
    let { vault } = await openVault(encryptedFile, 'pass123');

    // Add Entry
    const { vault: vault1, id } = addEntry(vault, {
      type: 'password',
      name: 'Google',
      favourite: false,
      data: {
        username: 'user@gmail.com',
        password: 'password123',
        category: 'email',
      },
    });

    expect(vault1.entries).toHaveLength(1);
    const added = getEntry(vault1, id);
    expect(added?.name).toBe('Google');

    // Toggle Favourite
    const vault2 = toggleFavourite(vault1, id);
    expect(getEntry(vault2, id)?.favourite).toBe(true);

    // Update Entry
    const vault3 = updateEntry(vault2, id, { name: 'Google Workspace' });
    expect(getEntry(vault3, id)?.name).toBe('Google Workspace');

    // Search
    const searchResults = searchEntries(vault3, 'workspace');
    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].id).toBe(id);

    // Filter by type
    const passEntries = getEntriesByType(vault3, 'password');
    expect(passEntries).toHaveLength(1);
    const keyEntries = getEntriesByType(vault3, 'key');
    expect(keyEntries).toHaveLength(0);

    // Delete Entry
    const vault4 = deleteEntry(vault3, id);
    expect(vault4.entries).toHaveLength(0);
  });

  it('should merge two vaults selecting newer entries on conflict', () => {
    const baseVault: Vault = {
      version: 1,
      meta: { createdAt: 1000, deviceId: 'd1', lastModified: 1000, version: 1 },
      entries: [
        {
          id: 'e1',
          type: 'note',
          name: 'Base Note',
          createdAt: 1000,
          updatedAt: 1000,
          favourite: false,
          data: { content: 'Original Content' },
        },
      ],
    };

    const incomingVault: Vault = {
      version: 1,
      meta: { createdAt: 2000, deviceId: 'd2', lastModified: 2000, version: 1 },
      entries: [
        {
          id: 'e1',
          type: 'note',
          name: 'Base Note',
          createdAt: 1000,
          updatedAt: 2000, // newer update
          favourite: true,
          data: { content: 'Updated Content' },
        },
        {
          id: 'e2',
          type: 'key',
          name: 'AWS Key',
          createdAt: 2000,
          updatedAt: 2000,
          favourite: false,
          data: { keyType: 'api_key', keyValue: 'AKIAIOSFODNN7EXAMPLE' },
        },
      ],
    };

    const merged = mergeVaults(baseVault, incomingVault);
    expect(merged.entries).toHaveLength(2);

    const mergedE1 = getEntry(merged, 'e1');
    expect(mergedE1?.updatedAt).toBe(2000);
    expect(mergedE1?.favourite).toBe(true);
  });
});
