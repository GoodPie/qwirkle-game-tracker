import { useCallback } from 'react';
import { ref, set, update, remove, get } from 'firebase/database';
import { database } from '../lib/firebase';
import { generateUniqueLobbyCodeWithFirebase } from '../utils/lobbyCode';
import type { Lobby, Player } from '../types/lobby';

interface CreateLobbyResult {
  success: boolean;
  lobbyCode?: string;
  error?: string;
}

interface JoinLobbyResult {
  success: boolean;
  error?: string;
}

interface LeaveLobbyResult {
  success: boolean;
  error?: string;
}

interface UseLobbyActionsReturn {
  createLobby: (userId: string, playerName?: string) => Promise<CreateLobbyResult>;
  joinLobby: (lobbyCode: string, userId: string, playerName?: string) => Promise<JoinLobbyResult>;
  leaveLobby: (lobbyCode: string, userId: string) => Promise<LeaveLobbyResult>;
}

/**
 * Custom hook for lobby management actions
 * Provides functions to create, join, and leave lobbies with proper error handling
 * 
 * @returns Object containing lobby action functions
 */
export const useLobbyActions = (): UseLobbyActionsReturn => {
  
  const createLobby = useCallback(async (
    userId: string, 
    playerName?: string
  ): Promise<CreateLobbyResult> => {
    try {
      if (!userId) {
        return {
          success: false,
          error: 'User ID is required to create a lobby',
        };
      }

      // Generate unique lobby code
      const lobbyCode = await generateUniqueLobbyCodeWithFirebase();
      console.debug("Lobby Code:", lobbyCode)
      
      // Create player object
      const player: Player = {
        id: userId,
        name: playerName || `Player 1`,
        joinedAt: Date.now(),
        isConnected: true,
      };

      // Create lobby object
      const lobby: Lobby = {
        code: lobbyCode,
        leaderId: userId,
        createdAt: Date.now(),
        gameState: 'waiting',
        players: {
          [userId]: player,
        },
      };

      // Save lobby to Firebase
      const lobbyRef = ref(database, `/lobbies/${lobbyCode}`);
      await set(lobbyRef, lobby);

      return {
        success: true,
        lobbyCode,
      };
    } catch (error) {
      console.error('Error creating lobby:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create lobby. Please try again.',
      };
    }
  }, []);

  const joinLobby = useCallback(async (
    lobbyCode: string,
    userId: string,
    playerName?: string
  ): Promise<JoinLobbyResult> => {
    try {
      if (!lobbyCode || !userId) {
        return {
          success: false,
          error: 'Lobby code and user ID are required',
        };
      }

      const lobbyRef = ref(database, `/lobbies/${lobbyCode}`);
      
      // Check if lobby exists
      const snapshot = await get(lobbyRef);
      if (!snapshot.exists()) {
        return {
          success: false,
          error: 'Lobby not found',
        };
      }

      const lobbyData = snapshot.val() as Lobby;
      
      // Check if user is already in the lobby
      if (lobbyData?.players[userId]) {
        // User is already in lobby, just update connection status
        const playerRef = ref(database, `/lobbies/${lobbyCode}/players/${userId}`);
        await update(playerRef, {
          isConnected: true,
        });
        
        return {
          success: true,
        };
      }

      // Generate player name if not provided
      const existingPlayerCount = lobbyData.players ? Object.keys(lobbyData.players).length : 0;
      const defaultPlayerName = playerName || `Player ${existingPlayerCount + 1}`;

      // Create new player object
      const newPlayer: Player = {
        id: userId,
        name: defaultPlayerName,
        joinedAt: Date.now(),
        isConnected: true,
      };

      // Add player to lobby
      const playerRef = ref(database, `/lobbies/${lobbyCode}/players/${userId}`);
      await set(playerRef, newPlayer);

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error joining lobby:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join lobby. Please try again.',
      };
    }
  }, []);

  const leaveLobby = useCallback(async (
    lobbyCode: string,
    userId: string
  ): Promise<LeaveLobbyResult> => {
    try {
      if (!lobbyCode || !userId) {
        return {
          success: false,
          error: 'Lobby code and user ID are required',
        };
      }

      const lobbyRef = ref(database, `/lobbies/${lobbyCode}`);
      
      // Get current lobby data
      const snapshot = await get(lobbyRef);
      if (!snapshot.exists()) {
        return {
          success: false,
          error: 'Lobby not found',
        };
      }

      const lobbyData = snapshot.val() as Lobby;
      
      // Check if user is in the lobby
      if (!lobbyData?.players[userId]) {
        return {
          success: false,
          error: 'User is not in this lobby',
        };
      }

      // Remove player from lobby
      const playerRef = ref(database, `/lobbies/${lobbyCode}/players/${userId}`);
      await remove(playerRef);

      // Check if lobby is now empty or if leader left
      const remainingPlayers = Object.keys(lobbyData.players).filter(id => id !== userId);
      
      if (remainingPlayers.length === 0) {
        // Lobby is empty, delete it
        await remove(lobbyRef);
      } else if (lobbyData.leaderId === userId) {
        // Leader left, transfer leadership to next player
        const newLeaderId = remainingPlayers[0];
        const leaderRef = ref(database, `/lobbies/${lobbyCode}/leaderId`);
        await set(leaderRef, newLeaderId);
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error leaving lobby:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to leave lobby. Please try again.',
      };
    }
  }, []);

  return {
    createLobby,
    joinLobby,
    leaveLobby,
  };
};