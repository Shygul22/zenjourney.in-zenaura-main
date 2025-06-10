import { useState, useEffect } from 'react';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut,
  Auth,
  AuthError
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = onAuthStateChanged(auth as Auth, 
        (firebaseUser) => {
          setUser(firebaseUser);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Auth state change error:', err);
          setError('Authentication connection failed');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Failed to setup auth listener:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      setError('Google sign-in requires Firebase configuration. Please use demo mode or contact support.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes for better user info
      provider.addScope('email');
      provider.addScope('profile');
      
      const result = await signInWithPopup(auth as Auth, provider);
      setUser(result.user);
    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = 'Sign-in failed. Please try again.';
      
      switch (authError.code) {
        case 'auth/api-key-not-valid':
          errorMessage = 'Firebase configuration issue. Please use demo mode or contact support.';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Google sign-in is not enabled. Please use demo mode.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain needs to be authorized in Firebase. Please use demo mode or add this domain to your Firebase project.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Sign-in popup was blocked. Please allow popups and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in was cancelled.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          errorMessage = `Sign-in failed: ${authError.message}`;
      }
      
      setError(errorMessage);
      console.error('Google sign in failed:', authError);
    } finally {
      setLoading(false);
    }
  };

  const signInDemo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a demo user for local development
      const demoUser: DemoUser = {
        uid: 'demo-user-' + Date.now(),
        email: 'demo@zenjourney.app',
        displayName: 'Demo User'
      };
      
      setUser(demoUser);
    } catch (err) {
      const error = err as Error;
      setError(`Demo sign-in failed: ${error.message}`);
      console.error('Demo sign in failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      
      if (!auth || (user && 'uid' in user && user.uid.startsWith('demo-user-'))) {
        // Demo mode logout
        setUser(null);
        return;
      }
      
      await firebaseSignOut(auth as Auth);
      setUser(null);
    } catch (err) {
      const error = err as Error;
      setError(`Sign-out failed: ${error.message}`);
      console.error('Sign out failed:', error);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInDemo,
    signOut,
    isAuthenticated: !!user
  };
};