import { render, screen, waitFor } from '@testing-library/react';
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

describe('PlayerList Component', () => {
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

  const mockPlayer3: Player = {
    id: 'user3',
    name: 'Player 3',
    joinedAt: 3000,
    isConnected: false, // Disconnected player
  };

  const baseLobby: Lobby = {
    code: 'ABC123',
    leaderId: 'user1',
    createdAt: 1000,
    gameState: 'waiting',
    players: {
      user1: mockPlayer1,
      user2: mockPlayer2,
      user3: mockPlayer3,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render player list with correct player count', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

      // Check header shows correct count (2 connected out of 3 total)
      expect(screen.getByText('Players (2/3)')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('should display all players in the lobby', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

      expect(screen.getByText('Player 1 (You)')).toBeInTheDocument();
      expect(screen.getByText('Player 2')).toBeInTheDocument();
      expect(screen.getByText('Player 3')).toBeInTheDocument();
    });

    it('should show empty state when no players', () => {
      const emptyLobby: Lobby = {
        ...baseLobby,
        players: {},
      };

      render(<PlayerList lobby={emptyLobby} />);

      expect(screen.getByText('No players in this lobby')).toBeInTheDocument();
    });
  });

  describe('Leader Identification', () => {
    it('should display crown icon for lobby leader', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user2" />);

      // Player 1 is the leader, should have crown
      const crownIcons = screen.getAllByTestId('crown-icon');
      expect(crownIcons).toHaveLength(1);
      
      // Check that crown is associated with the leader
      const leaderRow = screen.getByText('Player 1').closest('[role="listitem"]');
      expect(leaderRow).toContainElement(crownIcons[0]);
    });

    it('should sort leader first regardless of join time', () => {
      const lobbyWithLaterLeader: Lobby = {
        ...baseLobby,
        leaderId: 'user3', // Player 3 joined last but is leader
      };

      render(<PlayerList lobby={lobbyWithLaterLeader} currentUserId="user1" />);

      const playerItems = screen.getAllByRole('listitem');
      
      // Player 3 should be first despite joining last
      expect(playerItems[0]).toHaveTextContent('Player 3');
      expect(playerItems[0]).toContainElement(screen.getByTestId('crown-icon'));
    });
  });

  describe('Connection Status', () => {
    it('should show connection indicators for all players', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

      // Should have wifi icons for connected players
      const wifiIcons = screen.getAllByTestId('wifi-icon');
      expect(wifiIcons).toHaveLength(2); // Player 1 and 2 are connected

      // Should have wifi-off icon for disconnected player
      const wifiOffIcons = screen.getAllByTestId('wifi-off-icon');
      expect(wifiOffIcons).toHaveLength(1); // Player 3 is disconnected

      // Check connection status text
      expect(screen.getAllByText('Connected')).toHaveLength(2);
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('should apply opacity to disconnected players', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

      const disconnectedPlayerRow = screen.getByText('Player 3').closest('[role="listitem"]');
      expect(disconnectedPlayerRow).toHaveClass('opacity-60');
    });
  });

  describe('Current Turn Highlighting', () => {
    it('should highlight current turn player during game', () => {
      const playingLobby: Lobby = {
        ...baseLobby,
        gameState: 'playing',
        currentTurn: 'user2',
      };

      render(<PlayerList lobby={playingLobby} currentUserId="user1" />);

      // Player 2 should have current turn styling
      const currentTurnRow = screen.getByText('Player 2').closest('[role="listitem"]');
      expect(currentTurnRow).toHaveClass('bg-primary/10', 'border-primary/30', 'ring-2', 'ring-primary/20');

      // Should show "Your Turn" indicator
      expect(screen.getByText('Your Turn')).toBeInTheDocument();
    });

    it('should show game state indicator when game is playing', () => {
      const playingLobby: Lobby = {
        ...baseLobby,
        gameState: 'playing',
        currentTurn: 'user2',
      };

      render(<PlayerList lobby={playingLobby} currentUserId="user1" />);

      expect(screen.getByText("Waiting for Player 2's turn")).toBeInTheDocument();
    });

    it('should show "It\'s your turn!" when current user has turn', () => {
      const playingLobby: Lobby = {
        ...baseLobby,
        gameState: 'playing',
        currentTurn: 'user1',
      };

      render(<PlayerList lobby={playingLobby} currentUserId="user1" />);

      expect(screen.getByText("It's your turn!")).toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('should display scores when available', () => {
      const lobbyWithScores: Lobby = {
        ...baseLobby,
        scores: {
          user1: 25,
          user2: 18,
          user3: 12,
        },
      };

      render(<PlayerList lobby={lobbyWithScores} currentUserId="user1" />);

      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('18')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getAllByText('points')).toHaveLength(3);
    });

    it('should not display score section when scores are not available', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

      expect(screen.queryByText('points')).not.toBeInTheDocument();
    });
  });

  describe('Current User Identification', () => {
    it('should mark current user with "(You)" suffix', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user2" />);

      expect(screen.getByText('Player 2 (You)')).toBeInTheDocument();
      expect(screen.getByText('Player 1')).toBeInTheDocument(); // No "(You)" suffix
    });

    it('should apply special styling to current user row', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user2" />);

      const currentUserRow = screen.getByText('Player 2 (You)').closest('[role="listitem"]');
      expect(currentUserRow).toHaveClass('bg-primary/5', 'border-primary/20');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for player items', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

      const leaderItem = screen.getByLabelText(/Player Player 1.*lobby leader.*you/);
      expect(leaderItem).toBeInTheDocument();

      const regularPlayerItem = screen.getByLabelText('Player Player 2');
      expect(regularPlayerItem).toBeInTheDocument();
    });

    it('should have ARIA labels for connection status', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

      // Check for connection status indicators
      const connectedIndicators = screen.getAllByLabelText('Connected');
      expect(connectedIndicators).toHaveLength(2);

      const disconnectedIndicator = screen.getByLabelText('Disconnected');
      expect(disconnectedIndicator).toBeInTheDocument();
    });

    it('should have ARIA label for lobby leader crown', () => {
      render(<PlayerList lobby={baseLobby} currentUserId="user2" />);

      const crownIcon = screen.getByTestId('crown-icon');
      expect(crownIcon).toHaveAttribute('aria-label', 'Lobby Leader');
    });
  });

  describe('Real-time Updates', () => {
    it('should update last update time when lobby changes', async () => {
      const { rerender } = render(<PlayerList lobby={baseLobby} currentUserId="user1" />);

      // Initial render should show "0s ago"
      expect(screen.getByText('Updated 0s ago')).toBeInTheDocument();

      // Wait a bit and rerender with updated lobby
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const updatedLobby = {
        ...baseLobby,
        players: {
          ...baseLobby.players,
          user4: {
            id: 'user4',
            name: 'Player 4',
            joinedAt: 4000,
            isConnected: true,
          },
        },
      };

      rerender(<PlayerList lobby={updatedLobby} currentUserId="user1" />);

      // Should reset to "0s ago" after update
      expect(screen.getByText('Updated 0s ago')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className prop', () => {
      const { container } = render(
        <PlayerList lobby={baseLobby} currentUserId="user1" className="custom-class" />
      );

      const playerListContainer = container.firstChild as HTMLElement;
      expect(playerListContainer).toHaveClass('custom-class');
    });
  });
});