import { describe, it, expect } from 'vitest';

describe('useConnectionStatus', () => {
  it('should export useConnectionStatus function', async () => {
    const { useConnectionStatus } = await import('../useConnectionStatus');
    expect(typeof useConnectionStatus).toBe('function');
  });
});