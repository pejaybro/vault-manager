import { describe, it, expect, beforeEach } from 'vitest';
import {
  startSession,
  getSession,
  getSalt,
  updateSessionVault,
  lockVault,
  isUnlocked,
} from '../vault/session';
import { Vault } from '../models';
import { generateSalt, deriveKey } from '../crypto/keyDerivation';

describe('Session Manager', () => {
  beforeEach(() => {
    lockVault();
  });

  it('should initially be locked', () => {
    expect(isUnlocked()).toBe(false);
    expect(() => getSession()).toThrow('Vault is locked');
    expect(() => getSalt()).toThrow('Vault is locked');
  });

  it('should manage unlock and session state', async () => {
    const salt = generateSalt();
    const key = await deriveKey('password', salt);
    const vault: Vault = {
      version: 1,
      meta: { createdAt: 1000, deviceId: 'd1', lastModified: 1000, version: 1 },
      entries: [],
    };

    startSession(vault, key, salt);
    expect(isUnlocked()).toBe(true);
    expect(getSession().vault).toEqual(vault);
    expect(getSalt()).toEqual(salt);

    const updatedVault: Vault = {
      ...vault,
      meta: { ...vault.meta, lastModified: 2000 },
    };
    updateSessionVault(updatedVault);
    expect(getSession().vault).toEqual(updatedVault);

    lockVault();
    expect(isUnlocked()).toBe(false);
  });
});
