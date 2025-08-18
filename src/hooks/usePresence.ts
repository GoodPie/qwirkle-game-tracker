import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../lib/firebase';

interface UserPresence {
  state: 'online' | 'offline';
  last_changed: number;
}

export const usePresence = (userIds: string[]) => {
  const [presenceData, setPresenceData] = useState<Record<string, UserPresence>>({});

  useEffect(() => {
    if (userIds.length === 0) {
      setPresenceData({});
      return;
    }

    const listeners: Array<() => void> = [];

    userIds.forEach(userId => {
      const userStatusRef = ref(database, `/status/${userId}`);
      
      const unsubscribe = onValue(userStatusRef, (snapshot) => {
        const presence = snapshot.val() as UserPresence | null;
        
        setPresenceData(prev => ({
          ...prev,
          [userId]: presence || { state: 'offline', last_changed: Date.now() }
        }));
      });

      listeners.push(unsubscribe);
    });

    return () => {
      listeners.forEach(cleanup => cleanup());
    };
  }, [userIds]);

  const isUserOnline = (userId: string): boolean => {
    return presenceData[userId]?.state === 'online';
  };

  const getUserLastSeen = (userId: string): Date | null => {
    const presence = presenceData[userId];
    if (!presence) return null;
    
    return new Date(presence.last_changed);
  };

  return {
    presenceData,
    isUserOnline,
    getUserLastSeen,
  };
};