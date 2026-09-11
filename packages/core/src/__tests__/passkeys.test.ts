import { describe, it, expect } from 'vitest';
import { generatePasskey, signPasskeyChallenge } from '../crypto/passkeys';

describe('Passkeys / FIDO2 WebAuthn Engine', () => {
  it('should generate a valid ECDSA P-256 Passkey pair', async () => {
    const passkey = await generatePasskey('github.com', 'GitHub', 'octocat');

    expect(passkey.credentialId).toBeDefined();
    expect(passkey.rpId).toBe('github.com');
    expect(passkey.rpName).toBe('GitHub');
    expect(passkey.userName).toBe('octocat');
    expect(passkey.publicKeyPem).toBeDefined();
    expect(passkey.privateKeyPkcs8).toBeDefined();
  });

  it('should sign a WebAuthn login challenge correctly', async () => {
    const passkey = await generatePasskey('google.com', 'Google', 'user@gmail.com');
    const challengeBase64 = btoa('random_webauthn_challenge_12345');

    const signature = await signPasskeyChallenge(passkey, challengeBase64);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');
  });
});
