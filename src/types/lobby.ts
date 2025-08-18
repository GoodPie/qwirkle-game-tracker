export interface Player {
  id: string;
  name: string;
  joinedAt: number;
  isConnected: boolean;
}

export interface Lobby {
  code: string;
  leaderId: string;
  createdAt: number;
  gameState: 'waiting' | 'playing' | 'finished';
  players: Record<string, Player>;
  scores?: Record<string, number>;
  currentTurn?: string;
}