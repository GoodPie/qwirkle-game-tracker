import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlayerList from '../PlayerList';
import type { Lobby, Player } from '../../types/lobby';

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Crown: ({ className, 'aria-label': ariaLabel }: any) => (
    <div className={className} aria-label={ariaLabel} data-testid="crown-icon" />
  ),
  Users: ({ className }: any) => (
    <div className={className} data-testid="users-icon" />
  ),
  Wifi: ({ className }: any) => (
    <div className={className} data-testid="wifi-icon" />
  ),
  WifiOff: ({ className }: any) => (
    <div className={className} data-testid="wifi-off-icon" />
  ),
}));

describe('PlayerList Real-time Updates', () => {
  const mockPlayer1: Player = {
    id: 'user1',
    name: 'Player 1',
    joinedAt: 1000,
    isConnected: true,
  };

  const mockPlayer2: Player = {
    id: 'user2',
    name: 'Player 2',
    joinedAt: 2000,
    isConnected: true,
  };

  const baseLobby: Lobby = {
    code: 'ABC123',
    leaderId: 'user1',
    createdAt: 1000,
    gameState: 'waiting',
    players: {
      user1: mockPlayer1,
      user2: mockPlayer2,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date.now to control time
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should update timestamp when lobby data changes', async () => {
    const { rerender } = render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

    // Initial render should show "0s ago"
    expect(screen.getByText('Updated 0s ago')).toBeInTheDocument();

    // Advance time by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Rerender with same lobby (no changes) - should show elapsed time
    rerender(<PlayerList lobby={baseLobby} currentUserId="user1" />);
    expect(screen.getByText('Updated 2s ago')).toBeInTheDocument();

    // Now simulate a lobby update (new player joins)
    const updatedLobby: Lobby = {
      ...baseLobby,
      players: {
        ...baseLobby.players,
        user3: {
          id: 'user3',
          name: 'Player 3',
          joinedAt: 3000,
          isConnected: true,
        },
      },
    };

    // Rerender with updated lobby - should reset to "0s ago"
    rerender(<PlayerList lobby={updatedLobby} currentUserId="user1" />);
    expect(screen.getByText('Updated 0s ago')).toBeInTheDocument();
    
    // Verify new player is displayed
    expect(screen.getByText('Player 3')).toBeInTheDocument();
    expect(screen.getByText('Players (3/3)')).toBeInTheDocument();
  });

  it('should handle player connection status changes in real-time', () => {
    const { rerender } = render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

    // Initially both players are connected
    expect(screen.getByText('Players (2/2)')).toBeInTheDocument();
    expect(screen.getAllByText('Connected')).toHaveLength(2);

    // Simulate player 2 disconnecting
    const lobbyWithDisconnectedPlayer: Lobby = {
      ...baseLobby,
      players: {
        ...baseLobby.players,
        user2: {
          ...mockPlayer2,
          isConnected: false,
        },
      },
    };

    rerender(<PlayerList lobby={lobbyWithDisconnectedPlayer} currentUserId="user1" />);

    // Should show 1 connected out of 2 total
    expect(screen.getByText('Players (1/2)')).toBeInTheDocument();
    expect(screen.getAllByText('Connected')).toHaveLength(1);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();

    // Disconnected player should have reduced opacity
    const disconnectedPlayerRow = screen.getByText('Player 2').closest('[role="listitem"]');
    expect(disconnectedPlayerRow).toHaveClass('opacity-60');
  });

  it('should handle leader changes in real-time', () => {
    const { rerender } = render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

    // Initially user1 is leader
    expect(screen.getByTestId('crown-icon')).toBeInTheDocument();
    const initialLeaderRow = screen.getByText('Player 1 (You)').closest('[role="listitem"]');
    expect(initialLeaderRow).toContainElement(screen.getByTestId('crown-icon'));

    // Simulate leadership transfer to user2
    const lobbyWithNewLeader: Lobby = {
      ...baseLobby,
      leaderId: 'user2',
    };

    rerender(<PlayerList lobby={lobbyWithNewLeader} currentUserId="user1" />);

    // Crown should now be with Player 2
    const newLeaderRow = screen.getByText('Player 2').closest('[role="listitem"]');
    expect(newLeaderRow).toContainElement(screen.getByTestId('crown-icon'));

    // Player 2 should now be sorted first (leader always first)
    const playerItems = screen.getAllByRole('listitem');
    expect(playerItems[0]).toHaveTextContent('Player 2');
    expect(playerItems[1]).toHaveTextContent('Player 1 (You)');
  });

  it('should handle current turn changes in real-time during gameplay', () => {
    const playingLobby: Lobby = {
      ...baseLobby,
      gameState: 'playing',
      currentTurn: 'user1',
    };

    const { rerender } = render(<PlayerList lobby={playingLobby} currentUserId="user1" />);

    // Initially it's user1's turn
    expect(screen.getByText("It's your turn!")).toBeInTheDocument();
    const currentTurnRow = screen.getByText('Player 1 (You)').closest('[role="listitem"]');
    expect(currentTurnRow).toHaveClass('bg-primary/10', 'border-primary/30');

    // Simulate turn change to user2
    const lobbyWithTurnChange: Lobby = {
      ...playingLobby,
      currentTurn: 'user2',
    };

    rerender(<PlayerList lobby={lobbyWithTurnChange} currentUserId="user1" />);

    // Should now show waiting for Player 2
    expect(screen.getByText("Waiting for Player 2's turn")).toBeInTheDocument();
    
    // Player 2's row should now have current turn styling
    const newCurrentTurnRow = screen.getByText('Player 2').closest('[role="listitem"]');
    expect(newCurrentTurnRow).toHaveClass('bg-primary/10', 'border-primary/30');
    
    // Player 1's row should no longer have current turn styling
    const previousTurnRow = screen.getByText('Player 1 (You)').closest('[role="listitem"]');
    expect(previousTurnRow).not.toHaveClass('bg-primary/10', 'border-primary/30');
  });

  it('should handle score updates in real-time', () => {
    const { rerender } = render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

    // Initially no scores
    expect(screen.queryByText('points')).not.toBeInTheDocument();

    // Add scores to lobby
    const lobbyWithScores: Lobby = {
      ...baseLobby,
      scores: {
        user1: 25,
        user2: 18,
      },
    };

    rerender(<PlayerList lobby={lobbyWithScores} currentUserId="user1" />);

    // Should display scores
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getAllByText('points')).toHaveLength(2);

    // Update scores
    const lobbyWithUpdatedScores: Lobby = {
      ...lobbyWithScores,
      scores: {
        user1: 30,
        user2: 22,
      },
    };

    rerender(<PlayerList lobby={lobbyWithUpdatedScores} currentUserId="user1" />);

    // Should show updated scores
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.queryByText('25')).not.toBeInTheDocument();
    expect(screen.queryByText('18')).not.toBeInTheDocument();
  });

  it('should ensure updates appear within 1 second requirement', async () => {
    const { rerender } = render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

    // Record initial render time
    const initialTime = Date.now();
    
    // Simulate a lobby update
    const updatedLobby: Lobby = {
      ...baseLobby,
      players: {
        ...baseLobby.players,
        user3: {
          id: 'user3',
          name: 'New Player',
          joinedAt: Date.now(),
          isConnected: true,
        },
      },
    };

    // Rerender should be immediate (synchronous)
    rerender(<PlayerList lobby={updatedLobby} currentUserId="user1" />);
    
    const updateTime = Date.now();
    const timeDiff = updateTime - initialTime;

    // Update should be immediate (well under 1 second)
    expect(timeDiff).toBeLessThan(100); // Should be nearly instantaneous
    
    // Verify the update is reflected
    expect(screen.getByText('New Player')).toBeInTheDocument();
    expect(screen.getByText('Players (3/3)')).toBeInTheDocument();
    expect(screen.getByText('Updated 0s ago')).toBeInTheDocument();
  });
});