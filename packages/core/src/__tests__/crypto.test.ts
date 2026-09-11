import { describe, it, expect } from 'vitest';
import {
  generateSalt,
  deriveKey,
  uint8ToBase64,
  base64ToUint8,
} from '../crypto/keyDerivation';
import {
  encrypt,
  decrypt,
  encryptVault,
  decryptVault,
  sha256,
} from '../crypto/encryption';
import { Vault } from '../models';

describe('Crypto Engine', () => {
  it('should generate a 16-byte random salt', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1.length).toBe(16);
    expect(salt2.length).toBe(16);
    expect(salt1).not.toEqual(salt2);
  });

  it('should convert Uint8Array to base64 and back', () => {
    const original = new Uint8Array([1, 2, 3, 254, 255]);
    const base64 = uint8ToBase64(original);
    const converted = base64ToUint8(base64);
    expect(converted).toEqual(original);
  });

  it('should derive a key and perform encrypt/decrypt roundtrip', async () => {
    const password = 'SuperSecretMasterPassword123!';
    const salt = generateSalt();
    const key = await deriveKey(password, salt);

    const plaintext = 'Sensitive API Key or Password payload';
    const encrypted = await encrypt(plaintext, key);

    expect(encrypted.iv).toBeDefined();
    expect(encrypted.data).toBeDefined();

    const decrypted = await decrypt(encrypted.data, encrypted.iv, key);
    expect(decrypted).toBe(plaintext);
  });

  it('should encrypt and decrypt full Vault structure', async () => {
    const password = 'MyMasterPassword';
    const salt = generateSalt();
    const key = await deriveKey(password, salt);

    const vault: Vault = {
      version: 1,
      meta: {
        createdAt: 1000,
        deviceId: 'dev-123',
        lastModified: 1000,
        version: 1,
      },
      entries: [
        {
          id: 'e1',
          type: 'password',
          name: 'GitHub',
          createdAt: 1000,
          updatedAt: 1000,
          favourite: true,
          data: {
            username: 'octocat',
            password: 'gh_password_123',
            category: 'work',
          },
        },
      ],
    };

    const encryptedFile = await encryptVault(vault, key, salt);
    expect(encryptedFile.v).toBe(1);
    expect(encryptedFile.salt).toBe(uint8ToBase64(salt));
    expect(encryptedFile.iv).toBeDefined();
    expect(encryptedFile.data).toBeDefined();

    const decryptedVault = await decryptVault(encryptedFile, key);
    expect(decryptedVault).toEqual(vault);
  });

  it('should compute SHA-256 checksum correctly', async () => {
    const text = 'test string';
    const hash = await sha256(text);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
  });
});
