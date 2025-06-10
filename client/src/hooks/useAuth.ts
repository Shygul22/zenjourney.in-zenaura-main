import { useState, useEffect } from 'react';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  User 
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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setError(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInAnonymous = async () => {
    if (!auth) {
      setError('Firebase not initialized');
      return;
    }

    try {
      setLoading(true);
      const result = await signInAnonymously(auth);
      setUser(result.user);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Anonymous sign in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;
    
    try {
      await auth.signOut();
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
    signInAnonymous,
    signOut,
    isAuthenticated: !!user
  };
};