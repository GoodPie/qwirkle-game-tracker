import { useEffect, useState } from 'react';
import { Crown, Users, Wifi, WifiOff } from 'lucide-react';
import type { Player, Lobby } from '../types/lobby';

interface PlayerListProps {
  lobby: Lobby;
  currentUserId?: string;
  className?: string;
}

/**
 * PlayerList component that displays all connected players with real-time updates
 * Shows lobby leader indicator, current turn highlight, and connection status
 */
export default function PlayerList({ lobby, currentUserId, className = '' }: PlayerListProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Track when the component receives updates to ensure sub-1-second updates
  useEffect(() => {
    setLastUpdateTime(Date.now());
  }, [lobby.players]);

  // Sort players by join order (leader first, then by joinedAt timestamp)
  const sortedPlayers = Object.values(lobby.players).sort((a, b) => {
    // Leader always comes first
    if (a.id === lobby.leaderId) return -1;
    if (b.id === lobby.leaderId) return 1;
    // Then sort by join time
    return a.joinedAt - b.joinedAt;
  });

  const connectedPlayersCount = sortedPlayers.filter(player => player.isConnected).length;
  const totalPlayersCount = sortedPlayers.length;

  return (
    <div className={`bg-card rounded-lg border p-6 space-y-4 ${className}`}>
      {/* Header with player count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Players ({connectedPlayersCount}/{totalPlayersCount})
          </h2>
        </div>
        <div className="text-xs text-muted-foreground">
          Updated {Math.floor((Date.now() - lastUpdateTime) / 1000)}s ago
        </div>
      </div>

      {/* Players list */}
      <div className="space-y-3">
        {sortedPlayers.map((player: Player) => {
          const isLeader = player.id === lobby.leaderId;
          const isCurrentUser = player.id === currentUserId;
          const isCurrentTurn = lobby.currentTurn === player.id;
          const isConnected = player.isConnected;

          return (
            <div
              key={player.id}
              className={`
                flex items-center justify-between p-4 rounded-lg border transition-all duration-200
                ${isCurrentTurn 
                  ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20' 
                  : isCurrentUser
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30 hover:bg-muted/50'
                }
                ${!isConnected ? 'opacity-60' : ''}
              `}
              role="listitem"
              aria-label={`Player ${player.name}${isLeader ? ', lobby leader' : ''}${isCurrentTurn ? ', current turn' : ''}${isCurrentUser ? ', you' : ''}`}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {/* Connection status indicator */}
                <div 
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isConnected ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  aria-label={isConnected ? 'Connected' : 'Disconnected'}
                />
                
                {/* Player info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium truncate ${
                      isCurrentTurn ? 'text-primary font-semibold' : 'text-foreground'
                    }`}>
                      {player.name}
                      {isCurrentUser && ' (You)'}
                    </span>
                    
                    {/* Leader crown */}
                    {isLeader && (
                      <Crown 
                        className="h-4 w-4 text-yellow-500 flex-shrink-0" 
                        aria-label="Lobby Leader" 
                      />
                    )}
                    
                    {/* Current turn indicator */}
                    {isCurrentTurn && (
                      <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                        Your Turn
                      </div>
                    )}
                  </div>
                  
                  {/* Connection status text */}
                  <div className="flex items-center space-x-1 mt-1">
                    {isConnected ? (
                      <Wifi className="h-3 w-3 text-green-500" />
                    ) : (
                      <WifiOff className="h-3 w-3 text-gray-400" />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score display (if available) */}
              {lobby.scores && lobby.scores[player.id] !== undefined && (
                <div className="text-right">
                  <div className="text-lg font-semibold text-foreground">
                    {lobby.scores[player.id]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    points
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedPlayers.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No players in this lobby</p>
        </div>
      )}

      {/* Game state indicator */}
      {lobby.gameState === 'playing' && lobby.currentTurn && (
        <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-sm font-medium text-primary">
              {lobby.currentTurn === currentUserId 
                ? "It's your turn!" 
                : `Waiting for ${sortedPlayers.find(p => p.id === lobby.currentTurn)?.name || 'player'}'s turn`
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}