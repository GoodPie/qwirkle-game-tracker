import {getAuth, signInAnonymously, type User} from "firebase/auth";
import {app} from "./app.ts";

const RETRY_DELAY = 1000; // 1 second


export const auth = getAuth(app);

/**
 * Attempts to sign in anonymously and returns the authenticated user.
 * If the initial attempt fails, it retries once after a short delay.
 *
 * @returns {Promise<User>} A promise that resolves to the authenticated user object.
 * @throws Will throw an error if both the initial and retry attempts fail.
 */
export const signInAnonymouslyWithRetry = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign-in failed:', error);
    // Retry once after a short delay
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    const retryResult = await signInAnonymously(auth);
    return retryResult.user;
  }
};
