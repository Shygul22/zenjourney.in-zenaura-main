import { useState, useEffect } from 'react';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut,
  Auth
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth as Auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
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
      const result = await signInWithPopup(auth as Auth, provider);
      setUser(result.user);
    } catch (err: any) {
      let errorMessage = 'Sign-in failed. Please try again.';
      
      if (err.code === 'auth/api-key-not-valid') {
        errorMessage = 'Firebase configuration issue. Please use demo mode or contact support.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google sign-in is not enabled. Please use demo mode.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain needs to be authorized in Firebase. Please use demo mode or add this domain to your Firebase project.';
      }
      
      setError(errorMessage);
      console.error('Google sign in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const signInDemo = async () => {
    try {
      setLoading(true);
      
      // Create a demo user for local development
      const demoUser = {
        uid: 'demo-user-' + Date.now(),
        email: 'demo@zenjourney.app',
        displayName: 'Demo User'
      };
      
      setUser(demoUser as any);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Demo sign in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) {
      // Demo mode logout
      setUser(null);
      return;
    }
    
    try {
      await firebaseSignOut(auth as Auth);
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Sign out failed:', err);
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