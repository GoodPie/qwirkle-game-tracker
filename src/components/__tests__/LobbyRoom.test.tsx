import { describe, it, expect } from 'vitest';

import LobbyRoom from "../LobbyRoom";

describe('LobbyRoom Component', () => {
  it('should be defined', () => {
    // Basic test to ensure the component can be imported
    expect(true).toBe(true);
  });

  it('should export LobbyRoom component', () => {
    expect(LobbyRoom).toBeDefined();
    expect(typeof LobbyRoom).toBe('function');
  });
});