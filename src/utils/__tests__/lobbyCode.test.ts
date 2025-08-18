import { generateLobbyCode, validateLobbyCode, normalizeLobbyCode } from '../lobbyCode';

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
});