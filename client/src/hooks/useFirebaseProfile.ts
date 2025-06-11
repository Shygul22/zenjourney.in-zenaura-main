import { useState, useEffect } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { User } from 'firebase/auth';

interface DemoUser {
  uid: string;
  email: string;
  displayName: string;
}
import { db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    timezone: string;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalWorkDays: number;
  };
}

export const useFirebaseProfile = (user: User | DemoUser | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Skip Firebase profile for demo users
    if ('uid' in user && user.uid.startsWith('demo-user-')) {
      const demoProfile: UserProfile = {
        uid: user.uid,
        email: user.email || 'demo@zenjourney.app',
        displayName: user.displayName || 'Demo User',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          theme: 'system',
          notifications: true,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        stats: {
          totalTasks: 0,
          completedTasks: 0,
          totalWorkDays: 0
        }
      };
      setProfile(demoProfile);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupProfileListener = async () => {
      try {
        if (!db) {
          throw new Error('Database not initialized');
        }
        const profileRef = doc(db!, 'users', user.uid);
        
        // Check if profile exists, create if not
        const profileDoc = await getDoc(profileRef);
        
        if (!profileDoc.exists()) {
          // Create new user profile
          const firebaseUser = user as User;
          const newProfile: Omit<UserProfile, 'createdAt' | 'lastLoginAt'> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            preferences: {
              theme: 'system',
              notifications: true,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            stats: {
              totalTasks: 0,
              completedTasks: 0,
              totalWorkDays: 0
            }
          };

          await setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()
          });
        } else {
          // Update last login
          await setDoc(profileRef, {
            lastLoginAt: serverTimestamp()
          }, { merge: true });
        }

        // Listen for profile changes
        unsubscribe = onSnapshot(profileRef, 
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              const profile: UserProfile = {
                uid: data.uid,
                email: data.email,
                displayName: data.displayName,
                photoURL: data.photoURL,
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
                preferences: data.preferences || {
                  theme: 'system',
                  notifications: true,
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                stats: data.stats || {
                  totalTasks: 0,
                  completedTasks: 0,
                  totalWorkDays: 0
                }
              };
              setProfile(profile);
            }
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Error fetching user profile:', err);
            setError('Failed to load user profile');
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error('Error setting up profile listener:', err);
        setError(`Failed to setup profile: ${err.message}`);
        setLoading(false);
      }
    };

    setupProfileListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !db) {
      throw new Error('User not authenticated or database not available');
    }

    // Skip Firebase updates for demo users
    if ('uid' in user && user.uid.startsWith('demo-user-')) {
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
      return;
    }

    try {
      const profileRef = doc(db!, 'users', user.uid);
      await setDoc(profileRef, updates, { merge: true });
    } catch (err: any) {
      throw new Error(`Failed to update profile: ${err.message}`);
    }
  };

  const updateStats = async (statsUpdate: Partial<UserProfile['stats']>) => {
    if (!profile) return;

    const newStats = {
      ...profile.stats,
      ...statsUpdate
    };

    await updateProfile({ stats: newStats });
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateStats
  };
};