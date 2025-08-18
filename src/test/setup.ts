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
  get: vi.fn(),
  set: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  push: vi.fn(),
  onDisconnect: vi.fn(() => ({
    set: vi.fn(),
  })),
  serverTimestamp: vi.fn(() => ({ '.sv': 'timestamp' })),
}));

// Mock custom hooks
vi.mock('../hooks/useFirebaseAuth', () => ({
  useFirebaseAuth: vi.fn(() => ({
    user: { uid: 'test-user-id' },
    loading: false,
    error: null,
    retry: vi.fn(),
  })),
}));

vi.mock('../hooks/useLobbyActions', () => ({
  useLobbyActions: vi.fn(() => ({
    createLobby: vi.fn(),
    joinLobby: vi.fn(),
    leaveLobby: vi.fn(),
  })),
}));