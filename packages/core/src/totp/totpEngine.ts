// ============================================================
// TOTP ENGINE — RFC 6238
// Generates time-based one-time passwords (like Google Authenticator)
// ============================================================

import { totp, hotp } from 'otplib';
import type { TOTPData } from '../models';

/**
 * Generate a TOTP code for a given secret
 */
export function generateTOTP(secret: string, period = 30, digits = 6): string {
  totp.options = { step: period, digits };
  return totp.generate(secret);
}

/**
 * Get seconds remaining until the next code rotation
 */
export function getTimeRemaining(period = 30): number {
  const now = Math.floor(Date.now() / 1000);
  return period - (now % period);
}

/**
 * Get progress from 0 to 1 (1 = fresh code, 0 = about to expire)
 */
export function getProgress(period = 30): number {
  return getTimeRemaining(period) / period;
}

/**
 * Validate a Base32 TOTP secret
 */
export function validateSecret(secret: string): boolean {
  try {
    totp.options = { step: 30 };
    totp.generate(secret);
    return true;
  } catch {
    return false;
  }
}

/**
 * Parse an otpauth:// URI into TOTPData
 * e.g. otpauth://totp/GitHub:user@email.com?secret=ABC&issuer=GitHub
 */
export function parseTOTPUri(uri: string): Omit<TOTPData, 'id'> | null {
  try {
    const url = new URL(uri);
    if (url.protocol !== 'otpauth:') return null;

    const label = decodeURIComponent(url.pathname.slice(1)); // remove leading /
    const [issuerFromLabel, account] = label.includes(':')
      ? label.split(':')
      : ['', label];

    const params = url.searchParams;
    const secret = params.get('secret') ?? '';
    const issuer = params.get('issuer') ?? issuerFromLabel ?? '';
    const algorithm = (params.get('algorithm') ?? 'SHA1') as TOTPData['algorithm'];
    const digits = parseInt(params.get('digits') ?? '6', 10) as 6 | 8;
    const period = parseInt(params.get('period') ?? '30', 10) as 30 | 60;

    return { secret, issuer, account: account.trim(), algorithm, digits, period };
  } catch {
    return null;
  }
}

/**
 * Format a 6-digit code as "123 456" for readability
 */
export function formatCode(code: string): string {
  if (code.length === 6) return `${code.slice(0, 3)} ${code.slice(3)}`;
  if (code.length === 8) return `${code.slice(0, 4)} ${code.slice(4)}`;
  return code;
}
