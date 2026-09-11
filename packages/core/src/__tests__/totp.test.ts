import { describe, it, expect } from 'vitest';
import {
  generateTOTP,
  getTimeRemaining,
  getProgress,
  validateSecret,
  parseTOTPUri,
  formatCode,
} from '../totp/totpEngine';

describe('TOTP Engine', () => {
  const sampleSecret = 'JBSWY3DPEHPK3PXP'; // Base32 secret for "Hello!"

  it('should generate a 6-digit TOTP code', () => {
    const code = generateTOTP(sampleSecret);
    expect(code).toHaveLength(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
  });

  it('should format TOTP codes correctly', () => {
    expect(formatCode('123456')).toBe('123 456');
    expect(formatCode('12345678')).toBe('1234 5678');
  });

  it('should calculate time remaining and progress', () => {
    const remaining = getTimeRemaining(30);
    expect(remaining).toBeGreaterThanOrEqual(1);
    expect(remaining).toBeLessThanOrEqual(30);

    const progress = getProgress(30);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(1);
  });

  it('should validate base32 secrets', () => {
    expect(validateSecret(sampleSecret)).toBe(true);
    expect(validateSecret('invalid secret 123!@#')).toBe(false);
  });

  it('should parse valid otpauth:// URIs', () => {
    const uri = 'otpauth://totp/GitHub:user@domain.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub&period=30&digits=6';
    const parsed = parseTOTPUri(uri);

    expect(parsed).not.toBeNull();
    expect(parsed?.issuer).toBe('GitHub');
    expect(parsed?.account).toBe('user@domain.com');
    expect(parsed?.secret).toBe('JBSWY3DPEHPK3PXP');
    expect(parsed?.period).toBe(30);
    expect(parsed?.digits).toBe(6);
  });
});
