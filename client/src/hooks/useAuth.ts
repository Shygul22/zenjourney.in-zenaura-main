import { useState, useEffect } from 'react';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Register or get user from database
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName
            })
          });
          
          if (response.ok) {
            const userData = await response.json();
            setDbUser(userData);
          }
        } catch (err) {
          console.error('Error registering user:', err);
        }
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) {
      setError('Firebase not initialized');
      return;
    }

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Google sign in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const signInDemo = async () => {
    try {
      setLoading(true);
      
      // Create a demo user
      const demoUser = {
        uid: 'demo-user-' + Date.now(),
        email: 'demo@zenjourney.app',
        displayName: 'Demo User'
      };
      
      // Register demo user in database
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: demoUser.uid,
          email: demoUser.email,
          displayName: demoUser.displayName
        })
      });
      
      if (response.ok) {
        const userData = await response.json();
        setDbUser(userData);
        // Create a mock Firebase user object
        setUser({
          uid: demoUser.uid,
          email: demoUser.email,
          displayName: demoUser.displayName
        } as any);
        setError(null);
      }
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
      setDbUser(null);
      return;
    }
    
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setDbUser(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Sign out failed:', err);
    }
  };

  return {
    user,
    dbUser,
    loading,
    error,
    signInWithGoogle,
    signInDemo,
    signOut,
    isAuthenticated: !!user
  };
};