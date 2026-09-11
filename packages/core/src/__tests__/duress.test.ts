import { describe, it, expect } from 'vitest';
import { generateDecoyVault } from '../vault/duress';

describe('Duress Mode & Decoy Vault Engine', () => {
  it('should generate a valid non-empty decoy vault', () => {
    const decoy = generateDecoyVault();
    expect(decoy.version).toBe(1);
    expect(decoy.entries.length).toBeGreaterThan(0);
    expect(decoy.entries[0].name).toBe('Personal Email');
  });
});
