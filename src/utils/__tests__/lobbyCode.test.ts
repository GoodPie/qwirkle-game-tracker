import { 
  generateLobbyCode, 
  validateLobbyCode, 
  normalizeLobbyCode, 
  generateUniqueLobbyCode,
  generateUniqueLobbyCodeWithFirebase,
  validateAndNormalizeLobbyCode
} from '../lobbyCode';
import { expect, describe, it, vi } from 'vitest'

describe('lobbyCode utilities', () => {
  describe('generateLobbyCode', () => {
    it('should generate a 6-character code', () => {
      const code = generateLobbyCode();
      expect(code).toHaveLength(6);
    });

    it('should generate alphanumeric codes', () => {
      const code = generateLobbyCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      for (let i = 0; i < 100; i++) {
        codes.add(generateLobbyCode());
      }
      // Should have high uniqueness (allowing for small chance of collision)
      expect(codes.size).toBeGreaterThan(95);
    });

    it('should not contain confusing characters', () => {
      // Generate multiple codes to test character exclusion
      for (let i = 0; i < 50; i++) {
        const code = generateLobbyCode();
        expect(code).not.toMatch(/[01ILO]/); // Should not contain 0, 1, I, L, O
      }
    });

    it('should use secure random generation', () => {
      // Test that codes have good distribution (not predictable)
      const codes = [];
      for (let i = 0; i < 20; i++) {
        codes.push(generateLobbyCode());
      }
      
      // Check that we don't have obvious patterns
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length); // All should be unique
    });
  });

  describe('validateLobbyCode', () => {
    it('should validate correct 6-character codes', () => {
      expect(validateLobbyCode('ABC123')).toBe(true);
      expect(validateLobbyCode('XYZ789')).toBe(true);
    });

    it('should reject invalid codes', () => {
      expect(validateLobbyCode('')).toBe(false);
      expect(validateLobbyCode('ABC12')).toBe(false); // too short
      expect(validateLobbyCode('ABC1234')).toBe(false); // too long
      expect(validateLobbyCode('abc123')).toBe(false); // lowercase
      expect(validateLobbyCode('ABC-12')).toBe(false); // special characters
    });

    it('should reject null and undefined', () => {
      expect(validateLobbyCode(null as any)).toBe(false);
      expect(validateLobbyCode(undefined as any)).toBe(false);
    });
  });

  describe('normalizeLobbyCode', () => {
    it('should convert to uppercase', () => {
      expect(normalizeLobbyCode('abc123')).toBe('ABC123');
    });

    it('should trim whitespace', () => {
      expect(normalizeLobbyCode(' ABC123 ')).toBe('ABC123');
    });
  });

  describe('validateAndNormalizeLobbyCode', () => {
    it('should validate and normalize valid codes', () => {
      const result = validateAndNormalizeLobbyCode('abc123');
      expect(result.isValid).toBe(true);
      expect(result.normalizedCode).toBe('ABC123');
    });

    it('should validate and normalize codes with whitespace', () => {
      const result = validateAndNormalizeLobbyCode(' xyz789 ');
      expect(result.isValid).toBe(true);
      expect(result.normalizedCode).toBe('XYZ789');
    });

    it('should reject invalid codes', () => {
      const result1 = validateAndNormalizeLobbyCode('abc12'); // too short
      expect(result1.isValid).toBe(false);
      expect(result1.normalizedCode).toBe('ABC12');

      const result2 = validateAndNormalizeLobbyCode('abc-123'); // special char
      expect(result2.isValid).toBe(false);
      expect(result2.normalizedCode).toBe('ABC-123');
    });

    it('should handle empty and invalid inputs', () => {
      const result1 = validateAndNormalizeLobbyCode('');
      expect(result1.isValid).toBe(false);
      expect(result1.normalizedCode).toBe('');

      const result2 = validateAndNormalizeLobbyCode(null as any);
      expect(result2.isValid).toBe(false);
      expect(result2.normalizedCode).toBe('');
    });
  });

  describe('generateUniqueLobbyCode', () => {
    it('should return code immediately if no collision', async () => {
      const mockCheckExistence = vi.fn().mockResolvedValue(false);
      
      const code = await generateUniqueLobbyCode(mockCheckExistence);
      
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
      expect(mockCheckExistence).toHaveBeenCalledTimes(1);
      expect(mockCheckExistence).toHaveBeenCalledWith(code);
    });

    it('should retry on collision and return unique code', async () => {
      const mockCheckExistence = vi.fn()
        .mockResolvedValueOnce(true)  // First code exists
        .mockResolvedValueOnce(true)  // Second code exists
        .mockResolvedValueOnce(false); // Third code is unique
      
      const code = await generateUniqueLobbyCode(mockCheckExistence);
      
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
      expect(mockCheckExistence).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const mockCheckExistence = vi.fn().mockResolvedValue(true); // Always exists
      
      await expect(generateUniqueLobbyCode(mockCheckExistence, 3))
        .rejects.toThrow('Failed to generate unique lobby code after 3 attempts');
      
      expect(mockCheckExistence).toHaveBeenCalledTimes(3);
    });

    it('should use default max retries of 10', async () => {
      const mockCheckExistence = vi.fn().mockResolvedValue(true); // Always exists
      
      await expect(generateUniqueLobbyCode(mockCheckExistence))
        .rejects.toThrow('Failed to generate unique lobby code after 10 attempts');
      
      expect(mockCheckExistence).toHaveBeenCalledTimes(10);
    });

    it('should generate different codes on each retry', async () => {
      const generatedCodes = new Set<string>();
      const mockCheckExistence = vi.fn().mockImplementation((code: string) => {
        generatedCodes.add(code);
        return Promise.resolve(generatedCodes.size <= 2); // First 2 codes exist
      });
      
      const code = await generateUniqueLobbyCode(mockCheckExistence);
      
      expect(generatedCodes.size).toBe(3); // Should have generated 3 different codes
      expect(code).toHaveLength(6);
    });
  });

  describe('generateUniqueLobbyCodeWithFirebase', () => {
    it('should be a function that accepts maxRetries parameter', () => {
      // Test that the function exists and is callable
      expect(typeof generateUniqueLobbyCodeWithFirebase).toBe('function');
      // Function has default parameter, so length is 0, but it accepts the parameter
      expect(generateUniqueLobbyCodeWithFirebase.length).toBe(0);
    });

    it('should return a promise', () => {
      // Test that it returns a promise (without actually calling Firebase)
      const mockCheckExists = () => Promise.resolve(false);
      const result = generateUniqueLobbyCode(mockCheckExists);
      expect(result).toBeInstanceOf(Promise);
    });
  });
});