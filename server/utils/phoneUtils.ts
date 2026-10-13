/**
 * Utility for normalizing phone numbers into E.164-like format (e.g. +919876543210)
 */
export function normalizePhoneNumber(phone: string, defaultCountryCode = '91'): string {
  if (!phone) return '';

  // Strip all non-digit characters except leading plus
  let cleaned = phone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // If starting with 0, strip leading zeros
  cleaned = cleaned.replace(/^0+/, '');

  // If 10 digits (typical India phone number), attach default country code
  if (cleaned.length === 10) {
    return `+${defaultCountryCode}${cleaned}`;
  }

  // Otherwise return prefixed with +
  return `+${cleaned}`;
}

export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  // Basic sanity check: + followed by 10 to 15 digits
  return /^\+\d{10,15}$/.test(normalized);
}
