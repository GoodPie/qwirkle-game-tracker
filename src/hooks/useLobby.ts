import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, off, get } from 'firebase/database';
import { database } from '../lib/firebase';
import type { Lobby } from '../types/lobby';

interface UseLobbyState {
  lobby: Lobby | null;
  loading: boolean;
  error: string | null;
}

interface UseLobbyReturn extends UseLobbyState {
  refetch: () => Promise<void>;
}

/**
 * Custom hook for real-time lobby data synchronization
 * Provides real-time updates when lobby data changes in Firebase
 * 
 * @param lobbyCode - The 6-character lobby code to subscribe to
 * @returns Object containing lobby data, loading state, error state, and refetch function
 */
export const useLobby = (lobbyCode: string | null): UseLobbyReturn => {
  const [state, setState] = useState<UseLobbyState>({
    lobby: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(async () => {
    if (!lobbyCode) {
      setState({
        lobby: null,
        loading: false,
        error: null,
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const lobbyRef = ref(database, `/lobbies/${lobbyCode}`);
      const snapshot = await get(lobbyRef);
      
      if (snapshot.exists()) {
        const lobbyData = snapshot.val() as Lobby;
        setState({
          lobby: lobbyData,
          loading: false,
          error: null,
        });
      } else {
        setState({
          lobby: null,
          loading: false,
          error: 'Lobby not found',
        });
      }
    } catch (error) {
      console.error('Error fetching lobby data:', error);
      setState({
        lobby: null,
        loading: false,
        error: 'Failed to load lobby data. Please check your connection.',
      });
    }
  }, [lobbyCode]);

  useEffect(() => {
    if (!lobbyCode) {
      setState({
        lobby: null,
        loading: false,
        error: null,
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const lobbyRef = ref(database, `/lobbies/${lobbyCode}`);

    const handleValue = (snapshot: any) => {
      try {
        if (snapshot.exists()) {
          const lobbyData = snapshot.val() as Lobby;
          setState({
            lobby: lobbyData,
            loading: false,
            error: null,
          });
        } else {
          setState({
            lobby: null,
            loading: false,
            error: 'Lobby not found',
          });
        }
      } catch (error) {
        console.error('Error processing lobby data:', error);
        setState({
          lobby: null,
          loading: false,
          error: 'Failed to process lobby data',
        });
      }
    };

    const handleError = (error: any) => {
      console.error('Firebase listener error:', error);
      setState({
        lobby: null,
        loading: false,
        error: 'Connection error. Please check your network.',
      });
    };

    // Set up real-time listener
    onValue(lobbyRef, handleValue, handleError);

    // Cleanup function
    return () => {
      off(lobbyRef, 'value', handleValue);
    };
  }, [lobbyCode]);

  return {
    ...state,
    refetch,
  };
};