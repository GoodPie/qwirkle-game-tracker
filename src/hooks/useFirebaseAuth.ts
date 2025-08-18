import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, signInAnonymouslyWithRetry, setupPresence } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          // User is signed in
          setAuthState({
            user,
            loading: false,
            error: null,
          });
          
          // Set up presence tracking
          setupPresence(user.uid);
        } else {
          // No user is signed in, attempt anonymous sign-in
          try {
            setAuthState(prev => ({ ...prev, loading: true, error: null }));
            const anonymousUser = await signInAnonymouslyWithRetry();
            setAuthState({
              user: anonymousUser,
              loading: false,
              error: null,
            });
            
            // Set up presence tracking
            setupPresence(anonymousUser.uid);
          } catch (error) {
            console.error('Failed to sign in anonymously:', error);
            setAuthState({
              user: null,
              loading: false,
              error: 'Failed to authenticate. Please refresh the page.',
            });
          }
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        setAuthState({
          user: null,
          loading: false,
          error: 'Authentication error. Please refresh the page.',
        });
      }
    );

    return () => unsubscribe();
  }, []);

  const retry = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await signInAnonymouslyWithRetry();
      setAuthState({
        user,
        loading: false,
        error: null,
      });
      setupPresence(user.uid);
    } catch (error) {
      console.error('Retry authentication failed:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to authenticate. Please refresh the page.',
      }));
    }
  };

  return {
    ...authState,
    retry,
  };
};