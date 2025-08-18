// TypeScript
import { useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import type { Unsubscribe } from 'firebase/database';
import type { FirebaseError } from 'firebase/app';

import { auth, setupPresence, signInAnonymouslyWithRetry } from '../lib/firebase.ts';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Normalize and extract a readable message from unknown errors
const toErrorMessage = (err: unknown): string => {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const e = err as Partial<Error> & Partial<FirebaseError>;
    const code = 'code' in e && typeof e.code === 'string' ? ` (${e.code})` : '';
    if (e.message) return `${e.message}${code}`;
  }
  return 'Unexpected error occurred. Please try again.';
};

export const useFirebaseAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Keep the latest presence unsubscribe accessible to both effect and retry
  const presenceUnsubRef = useRef<Unsubscribe | null>(null);

  const attachPresence = (uid: string) => {
    // Clean up existing listener first
    if (presenceUnsubRef.current) {
      presenceUnsubRef.current();
      presenceUnsubRef.current = null;
    }
    presenceUnsubRef.current = setupPresence(uid);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          setAuthState({ user, loading: false, error: null });
          attachPresence(user.uid);
          return;
        }

        try {
          setAuthState((prev) => ({ ...prev, loading: true, error: null }));
          const anonymousUser = await signInAnonymouslyWithRetry();
          setAuthState({ user: anonymousUser, loading: false, error: null });
          attachPresence(anonymousUser.uid);
        } catch (err: unknown) {
          console.error('Anonymous sign-in failed:', err);
          setAuthState({
            user: null,
            loading: false,
            error: toErrorMessage(err),
          });
        }
      },
      (err: unknown) => {
        console.error('Auth state change error:', err);
        setAuthState({
          user: null,
          loading: false,
          error: toErrorMessage(err),
        });
      }
    );

    return () => {
      // Clean up presence and auth listener on unmount
      if (presenceUnsubRef.current) {
        presenceUnsubRef.current();
        presenceUnsubRef.current = null;
      }
      unsubscribeAuth();
    };
  }, []);

  const retry = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      const user = await signInAnonymouslyWithRetry();
      setAuthState({ user, loading: false, error: null });
      attachPresence(user.uid);
    } catch (err: unknown) {
      console.error('Retry authentication failed:', err);
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: toErrorMessage(err),
      }));
    }
  };

  return {
    ...authState,
    retry,
  };
};