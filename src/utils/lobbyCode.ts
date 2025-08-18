/**
 * Generates a secure 6-character alphanumeric lobby code
 * Excludes confusing characters (0/O, 1/I/L) for better UX
 */
export function generateLobbyCode(): string {
  // Characters excluding confusing ones: 0, O, 1, I, L
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const codeLength = 6;
  
  // Use crypto.getRandomValues for secure random generation
  const array = new Uint8Array(codeLength);
  crypto.getRandomValues(array);
  
  let code = '';
  for (let i = 0; i < codeLength; i++) {
    code += chars[array[i] % chars.length];
  }
  
  return code;
}

/**
 * Validates lobby code format
 * @param code - The lobby code to validate
 * @returns true if code is valid 6-character alphanumeric format
 */
export function validateLobbyCode(code: string): boolean {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  // Check if code is exactly 6 characters and uppercase alphanumeric
  const codeRegex = /^[A-Z0-9]{6}$/;
  return codeRegex.test(code);
}

/**
 * Normalizes lobby code to uppercase
 * @param code - The lobby code to normalize
 * @returns normalized code in uppercase
 */
export function normalizeLobbyCode(code: string): string {
  return code.toUpperCase().trim();
}