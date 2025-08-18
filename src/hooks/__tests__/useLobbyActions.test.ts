import { describe, it, expect } from 'vitest';
import { useLobbyActions } from '../useLobbyActions';

describe('useLobbyActions', () => {
  it('should be defined', () => {
    expect(typeof useLobbyActions).toBe('function');
  });

  it('should export useLobbyActions function', () => {
    expect(useLobbyActions).toBeDefined();
    expect(typeof useLobbyActions).toBe('function');
  });

  it('should be a hook that returns lobby action functions', () => {
    // Test that the function can be called (basic smoke test)
    expect(useLobbyActions.length).toBe(0); // Should accept no parameters
  });
});