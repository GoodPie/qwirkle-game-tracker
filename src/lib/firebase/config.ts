export const firebaseConfig = {
  // Your config here
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'test-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'test.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://test.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'test-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'test.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:test'
};