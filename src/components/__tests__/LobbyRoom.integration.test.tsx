import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LobbyRoom from '../LobbyRoom';
import type { Lobby } from '../../types/lobby';

// Mock the hooks
vi.mock('../../hooks/useFirebaseAuth', () => ({
  useFirebaseAuth: vi.fn(() => ({
    user: { uid: 'test-user-id', displayName: 'Test User' },
    loading: false,
    error: null,
  })),
}));

vi.mock('../../hooks/useLobby', () => ({
  useLobby: vi.fn(() => ({
    lobby: {
      code: 'ABC123',
      leaderId: 'test-user-id',
      createdAt: 1000,
      gameState: 'waiting',
      players: {
        'test-user-id': {
          id: 'test-user-id',
          name: 'Test User',
          joinedAt: 1000,
          isConnected: true,
        },
        'other-user': {
          id: 'other-user',
          name: 'Other Player',
          joinedAt: 2000,
          isConnected: true,
        },
      },
    } as Lobby,
    loading: false,
    error: null,
  })),
}));

vi.mock('../../hooks/useLobbyActions', () => ({
  useLobbyActions: vi.fn(() => ({
    leaveLobby: vi.fn(),
  })),
}));

// Mock react-router-dom params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ code: 'ABC123' }),
    useNavigate: () => vi.fn(),
  };
});

const renderLobbyRoom = () => {
  return render(
    <BrowserRouter>
      <LobbyRoom />
    </BrowserRouter>
  );
};

describe('LobbyRoom Integration with PlayerList', () => {
  it('should render PlayerList component within LobbyRoom', () => {
    renderLobbyRoom();

    // Check that the PlayerList is rendered with correct data
    expect(screen.getByText('Players (2/2)')).toBeInTheDocument();
    expect(screen.getByText('Test User (You)')).toBeInTheDocument();
    expect(screen.getByText('Other Player')).toBeInTheDocument();
  });

  it('should show lobby leader crown in PlayerList', () => {
    renderLobbyRoom();

    // The test user is the leader, so should see crown
    expect(screen.getByTestId('crown-icon')).toBeInTheDocument();
  });

  it('should show connection status for all players', () => {
    renderLobbyRoom();

    // Both players are connected
    const connectedTexts = screen.getAllByText('Connected');
    expect(connectedTexts).toHaveLength(2);
  });
});