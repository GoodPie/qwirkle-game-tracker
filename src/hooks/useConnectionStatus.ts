import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../lib/firebase';

interface ConnectionStatus {
  isConnected: boolean;
  isReconnecting: boolean;
}

export const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: true,
    isReconnecting: false,
  });

  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const isConnected = snapshot.val() === true;

      setStatus(prev => {
        // If we were disconnected and now we're connected, we're reconnecting
        const isReconnecting = !prev.isConnected && isConnected;

        return {
          isConnected,
          isReconnecting,
        };
      });

      // Clear reconnecting status after a short delay
      if (isConnected) {
        setTimeout(() => {
          setStatus(prev => ({ ...prev, isReconnecting: false }));
        }, 2000);
      }
    });

    return unsubscribe;
  }, []);

  return status;
};