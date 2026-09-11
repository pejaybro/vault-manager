// ============================================================
// PASSKEYS / FIDO2 WEBAUTHN ENGINE
// Generates ECDSA P-256 keypairs for passwordless sign-ins
// ============================================================

import { uint8ToBase64, base64ToUint8 } from './keyDerivation';

export interface PasskeyData {
  credentialId: string;       // Base64 WebAuthn Credential ID
  rpId: string;               // Relying Party ID (e.g. "github.com")
  rpName: string;             // Relying Party Name (e.g. "GitHub")
  userHandle: string;         // User account identifier
  userName: string;           // Display username
  publicKeyPem: string;       // Exported Public Key PEM / Base64
  privateKeyPkcs8: string;   // Exported Encrypted Private Key Base64
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
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true, // extractable for vault encryption
    ['sign', 'verify']
  );

  // Generate random 16-byte credential ID
  const credentialIdBytes = new Uint8Array(16);
  crypto.getRandomValues(credentialIdBytes);
  const credentialId = uint8ToBase64(credentialIdBytes);

  // Export public key
  const rawPublicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyPem = uint8ToBase64(new Uint8Array(rawPublicKey));

  // Export private key
  const rawPrivateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateKeyPkcs8 = uint8ToBase64(new Uint8Array(rawPrivateKey));

  return {
    credentialId,
    rpId,
    rpName,
    userHandle: userName,
    userName,
    publicKeyPem,
    privateKeyPkcs8,
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

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBytes as any,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const challengeBytes = base64ToUint8(challengeBase64);

  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    challengeBytes as any
  );

  return uint8ToBase64(new Uint8Array(signature));
}
