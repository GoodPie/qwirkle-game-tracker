const MAX_REGENERATION_ATTEMPTS = 100;

/**
 * Generates a secure 6-character alphanumeric lobby code
 * Excludes confusing characters (0/O, 1/I/L) for better UX
 * Uses crypto.getRandomValues() for cryptographically secure randomness
 */
export function generateLobbyCode(attempts = 0): string {
  // Characters excluding confusing ones: 0, O, 1, I, L
  const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const codeLength = 6;
  
  // Validate that crypto.getRandomValues is available
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('crypto.getRandomValues is not available in this environment');
  }
  
  // Use crypto.getRandomValues for secure random generation
  const array = new Uint8Array(codeLength);
  crypto.getRandomValues(array);
  
  let code = '';
  for (let i = 0; i < codeLength; i++) {
    // Use modulo to map random bytes to character set
    code += chars[array[i] % chars.length];
  }
  
  // Additional validation: ensure code doesn't contain excluded characters
  if (/[01ILO]/.test(code)) {
    if (attempts >= MAX_REGENERATION_ATTEMPTS) {
      throw new Error('Failed to generate a unique lobby code after multiple attempts');
    }

    // This should never happen with our character set, but safety check
    return generateLobbyCode(attempts++); // Recursive retry until retry
  }
  
  return code;
}

/**
 * Generates a unique lobby code with collision detection
 * @param checkExistence - Function to check if a code already exists
 * @param maxRetries - Maximum number of retry attempts (default: 10)
 * @returns Promise that resolves to a unique lobby code
 * @throws Error if unable to generate unique code after max retries
 */
export async function generateUniqueLobbyCode(
  checkExistence: (code: string) => Promise<boolean>,
  maxRetries: number = 10
): Promise<string> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    const code = generateLobbyCode();
    const exists = await checkExistence(code);
    
    if (!exists) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error(`Failed to generate unique lobby code after ${maxRetries} attempts`);
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
 * Validates and normalizes lobby code format
 * @param code - The lobby code to validate and normalize
 * @returns object with isValid boolean and normalized code
 */
export function validateAndNormalizeLobbyCode(code: string): { isValid: boolean; normalizedCode: string } {
  if (!code || typeof code !== 'string') {
    return { isValid: false, normalizedCode: '' };
  }
  
  const normalizedCode = normalizeLobbyCode(code);
  const isValid = validateLobbyCode(normalizedCode);
  
  return { isValid, normalizedCode };
}

/**
 * Normalizes lobby code to uppercase
 * @param code - The lobby code to normalize
 * @returns normalized code in uppercase
 */
export function normalizeLobbyCode(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * Generates a unique lobby code using Firebase collision detection
 * @param maxRetries - Maximum number of retry attempts (default: 10)
 * @returns Promise that resolves to a unique lobby code
 * @throws Error if unable to generate unique code after max retries
 */
export async function generateUniqueLobbyCodeWithFirebase(maxRetries: number = 10): Promise<string> {
  // Dynamic import to avoid circular dependencies and allow for testing
  const { checkLobbyExists } = await import('../lib/firebase');
  return generateUniqueLobbyCode(checkLobbyExists, maxRetries);
}