import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('zenjourney-user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setDbUser(userData);
    }
    setLoading(false);
  }, []);

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
        setUser({
          uid: demoUser.uid,
          email: demoUser.email,
          displayName: demoUser.displayName
        });
        // Save to localStorage
        localStorage.setItem('zenjourney-user', JSON.stringify(userData));
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
    setUser(null);
    setDbUser(null);
    localStorage.removeItem('zenjourney-user');
  };

  return {
    user,
    dbUser,
    loading,
    error,
    signInDemo,
    signOut,
    isAuthenticated: !!user
  };
};