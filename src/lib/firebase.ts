import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import { getDatabase, ref, onDisconnect, serverTimestamp, set, onValue, get } from 'firebase/database';

const firebaseConfig = {
  // Your config here
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'test-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'test.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://test.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'test.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:test'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Authentication state management
export const signInAnonymouslyWithRetry = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    // Retry once after a short delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const retryResult = await signInAnonymously(auth);
    return retryResult.user;
  }
};

// Lobby management
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

// Connection status management
import { ref, onValue, onDisconnect, set, serverTimestamp, Unsubscribe } from 'firebase/database';

const setupPresence = (userId: string): Unsubscribe => {
  const userStatusRef = ref(database, `/status/${userId}`);
  const isOfflineForDatabase = {
    state: 'offline',
    last_changed: serverTimestamp(),
  };

  const isOnlineForDatabase = {
    state: 'online',
    last_changed: serverTimestamp(),
  };

  // Set up presence system
  const connectedRef = ref(database, '.info/connected');
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    if (snapshot.val() === false) {
      return;
    }

    // Set user as online
    set(userStatusRef, isOnlineForDatabase);

    // Set user as offline when they disconnect
    onDisconnect(userStatusRef).set(isOfflineForDatabase);
  });

  // Return unsubscribe function
  return unsubscribe;
};
