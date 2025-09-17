// Utility functions for card identifier and affiliate code generation

/**
 * Generates a unique card identifier in format: MLYY-XXXXXXXXX-01
 * ML = Mali country code
 * YY = Current year (last 2 digits)
 * XXXXXXXXX = 9 unique alphanumeric characters
 * 01 = Country number
 */
export function generateCardIdentifier(): string {
  const countryCode = 'ML';
  const currentYear = new Date().getFullYear().toString().slice(-2); // Get last 2 digits of current year
  const countryNumber = '01';
  
  // Generate 9 random alphanumeric characters (excluding confusing characters like 0, O, I, l)
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let uniqueCode = '';
  
  for (let i = 0; i < 9; i++) {
    uniqueCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `${countryCode}${currentYear}-${uniqueCode}-${countryNumber}`;
}

/**
 * Generates a unique affiliate code (8-12 characters)
 * Uses alphanumeric characters excluding confusing ones
 */
export function generateAffiliateCode(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const length = Math.floor(Math.random() * 5) + 8; // Random length between 8-12
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Validates card identifier format
 */
export function isValidCardIdentifier(identifier: string): boolean {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const pattern = new RegExp(`^ML${currentYear}-[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{9}-01$`);
  return pattern.test(identifier);
}

/**
 * Validates affiliate code format
 */
export function isValidAffiliateCode(code: string): boolean {
  const pattern = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8,12}$/;
  return pattern.test(code);
}

/**
 * Formats card identifier for display (adds dashes if missing)
 */
export function formatCardIdentifier(identifier: string): string {
  if (!identifier) return '';
  
  // If already formatted, return as is
  if (identifier.includes('-')) return identifier;
  
  // If raw format, add dashes
  if (identifier.length === 15) {
    return `${identifier.slice(0, 4)}-${identifier.slice(4, 13)}-${identifier.slice(13)}`;
  }
  
  return identifier;
}

/**
 * Formats card identifier as card number for display
 * Converts ML25-XXXXXXXXX-01 to **** **** **** XXXX format
 */
export function formatCardNumber(cardIdentifier: string): string {
  if (!cardIdentifier) return '**** **** **** ****';
  
  // Extract the unique part (9 characters) from ML25-XXXXXXXXX-01
  const parts = cardIdentifier.split('-');
  if (parts.length === 3) {
    const uniqueCode = parts[1]; // XXXXXXXXX
    if (uniqueCode.length >= 4) {
      return `**** **** **** ${uniqueCode.slice(-4)}`;
    }
  }
  
  // Fallback: use last 4 characters of the full identifier (removing dashes)
  const cleanIdentifier = cardIdentifier.replace(/-/g, '');
  return `**** **** **** ${cleanIdentifier.slice(-4)}`;
}

/**
 * Generates referral link with affiliate code
 */
export function generateReferralLink(affiliateCode: string, baseUrl?: string): string {
  const base = baseUrl || window.location.origin;
  return `${base}/register?ref=${affiliateCode}`;
}
