import { describe, it, expect } from 'vitest';
import { hashToken, hashPassword, comparePassword } from '../../server/utils/hashUtils';

describe('Hash Utilities', () => {
  it('should generate consistent SHA-256 hashes for access codes', () => {
    const code = 'HSC-TEST-2025';
    const hash1 = hashToken(code);
    const hash2 = hashToken(code);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it('should hash and compare passwords securely using bcrypt', async () => {
    const password = 'SecurePassword123!';
    const hash = await hashPassword(password);
    expect(await comparePassword(password, hash)).toBe(true);
    expect(await comparePassword('WrongPassword', hash)).toBe(false);
  });
});
