import { describe, it, expect } from 'vitest';
import { auditVaultHealth } from '../vault/vaultAudit';
import { Vault } from '../models';

describe('Vault Security Audit & Health Engine', () => {
  it('should return 100% health score for empty vault', () => {
    const report = auditVaultHealth(null);
    expect(report.score).toBe(100);
    expect(report.totalPasswords).toBe(0);
  });

  it('should detect weak and reused passwords accurately', () => {
    const testVault: Vault = {
      version: 1,
      meta: { createdAt: 1000, deviceId: 'd1', lastModified: 1000, version: 1 },
      entries: [
        {
          id: 'p1',
          type: 'password',
          name: 'Site 1',
          createdAt: 1000,
          updatedAt: 1000,
          favourite: false,
          data: { username: 'user1', password: 'password123', category: 'work' },
        },
        {
          id: 'p2',
          type: 'password',
          name: 'Site 2',
          createdAt: 1000,
          updatedAt: 1000,
          favourite: false,
          data: { username: 'user2', password: 'password123', category: 'social' },
        },
        {
          id: 'p3',
          type: 'password',
          name: 'Site 3',
          createdAt: 1000,
          updatedAt: 1000,
          favourite: false,
          data: { username: 'user3', password: 'SuperComplex#987!Password', category: 'banking' },
        },
      ],
    };

    const report = auditVaultHealth(testVault);
    expect(report.totalPasswords).toBe(3);
    expect(report.weakCount).toBe(2); // 'password123' is weak
    expect(report.reusedCount).toBe(2); // 'password123' reused twice
    expect(report.score).toBeLessThan(100);
  });
});
