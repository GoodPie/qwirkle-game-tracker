import { describe, it, expect } from 'vitest';
import { useLobby } from '@/hooks/useLobby';

describe('useLobby', () => {
  it('should be defined', () => {
    expect(typeof useLobby).toBe('function');
  });

  it('should export useLobby function', () => {
    expect(useLobby).toBeDefined();
    expect(typeof useLobby).toBe('function');
  });

  it('should accept lobbyCode parameter', () => {
    // Test that the function can be called with expected parameters
    expect(useLobby.length).toBe(1); // Should accept 1 parameter
  });
});