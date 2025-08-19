import { describe, it, expect } from 'vitest';

import LobbyRoom from "@/components/LobbyRoom";

describe('LobbyRoom Component', () => {
  it('should export LobbyRoom component', () => {
    expect(LobbyRoom).toBeDefined();
    expect(typeof LobbyRoom).toBe('function');
  });
});