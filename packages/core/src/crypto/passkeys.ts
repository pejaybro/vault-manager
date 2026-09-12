// ============================================================
// PASSKEYS / FIDO2 WEBAUTHN ENGINE
// Generates ECDSA P-256 keypairs for passwordless sign-ins
// Pure JavaScript using @noble/curves and @noble/hashes
// ============================================================

import { p256 } from '@noble/curves/nist.js';
import { randomBytes } from '@noble/hashes/utils.js';
import { uint8ToBase64, base64ToUint8 } from './keyDerivation';

export interface PasskeyData {
  credentialId: string;       // Base64 WebAuthn Credential ID
  rpId: string;               // Relying Party ID (e.g. "github.com")
  rpName: string;             // Relying Party Name (e.g. "GitHub")
  userHandle: string;         // User account identifier
  userName: string;           // Display username
  publicKeyPem: string;       // Exported Public Key Base64 (65-byte uncompressed point)
  privateKeyPkcs8: string;   // Exported Private Key Base64 (32-byte scalar)
  signCount: number;          // Sign counter
}

/**
 * Generate a new FIDO2 / WebAuthn ECDSA P-256 keypair
 */
export async function generatePasskey(
  rpId: string,
  rpName: string,
  userName: string
): Promise<PasskeyData> {
  const { secretKey, publicKey } = p256.keygen();
  const credentialIdBytes = randomBytes(16);

  return {
    credentialId: uint8ToBase64(credentialIdBytes),
    rpId,
    rpName,
    userHandle: userName,
    userName,
    publicKeyPem: uint8ToBase64(publicKey),
    privateKeyPkcs8: uint8ToBase64(secretKey),
    signCount: 0,
  };
}

/**
 * Sign a WebAuthn challenge with the stored private key
 */
export async function signPasskeyChallenge(
  passkey: PasskeyData,
  challengeBase64: string
): Promise<string> {
  const privateKeyBytes = base64ToUint8(passkey.privateKeyPkcs8);
  const challengeBytes = base64ToUint8(challengeBase64);
  const sig = p256.sign(challengeBytes, privateKeyBytes);

  return uint8ToBase64(sig);
}
