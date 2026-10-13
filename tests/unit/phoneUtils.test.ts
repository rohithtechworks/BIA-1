import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, isValidPhoneNumber } from '../../server/utils/phoneUtils';

describe('Phone Number Utilities', () => {
  it('should normalize 10-digit Indian phone numbers with country code', () => {
    expect(normalizePhoneNumber('9876543210')).toBe('+919876543210');
    expect(normalizePhoneNumber(' 9876543210 ')).toBe('+919876543210');
    expect(normalizePhoneNumber('98765-43210')).toBe('+919876543210');
  });

  it('should preserve existing country code if starting with +', () => {
    expect(normalizePhoneNumber('+919876543210')).toBe('+919876543210');
    expect(normalizePhoneNumber('+14155552671')).toBe('+14155552671');
  });

  it('should validate formatted phone numbers', () => {
    expect(isValidPhoneNumber('+919876543210')).toBe(true);
    expect(isValidPhoneNumber('123')).toBe(false);
  });
});
