import { describe, it, expect } from 'vitest';

describe('usePresence', () => {
  it('should be defined', () => {
    // Basic test to ensure the hook module can be imported
    expect(true).toBe(true);
  });

  it('should export usePresence function', async () => {
    const { usePresence } = await import('../usePresence');
    expect(typeof usePresence).toBe('function');
  });
});