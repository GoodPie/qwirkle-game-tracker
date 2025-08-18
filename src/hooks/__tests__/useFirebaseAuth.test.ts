import { describe, it, expect } from 'vitest';

describe('useFirebaseAuth', () => {

  it('should export useFirebaseAuth function', async () => {
    const { useFirebaseAuth } = await import('../useFirebaseAuth');
    expect(typeof useFirebaseAuth).toBe('function');
  });
});