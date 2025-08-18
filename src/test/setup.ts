import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase to prevent initialization errors in tests
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInAnonymously: vi.fn(),
  onAuthStateChanged: vi.fn(),
}));

vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({})),
  ref: vi.fn(),
  onValue: vi.fn(),
  off: vi.fn(),
  onDisconnect: vi.fn(() => ({
    set: vi.fn(),
  })),
  serverTimestamp: vi.fn(() => ({ '.sv': 'timestamp' })),
  set: vi.fn(),
}));