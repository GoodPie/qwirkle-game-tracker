import {get, getDatabase, onDisconnect, onValue, ref, serverTimestamp, set, type Unsubscribe} from "firebase/database";
import {app} from "./app.ts";

export const database = getDatabase(app);

export const checkLobbyExists = async (lobbyCode: string): Promise<boolean> => {
  try {
    const lobbyRef = ref(database, `/lobbies/${lobbyCode}`);
    const snapshot = await get(lobbyRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking lobby existence:', error);
    // In case of error, assume it doesn't exist to allow retry
    return false;
  }
};

export const setupPresence = (userId: string): Unsubscribe => {
  const userStatusRef = ref(database, `/status/${userId}`);

  const isOfflineForDatabase = {
    state: 'offline',
    last_changed: serverTimestamp(),
  };

  const isOnlineForDatabase = {
    state: 'online',
    last_changed: serverTimestamp(),
  };

  const connectedRef = ref(database, '.info/connected');
  return onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    // Mark online and register offline handler
    set(userStatusRef, isOnlineForDatabase);
    onDisconnect(userStatusRef).set(isOfflineForDatabase);
  });
};