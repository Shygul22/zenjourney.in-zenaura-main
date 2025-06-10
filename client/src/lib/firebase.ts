import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration and initialization
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDx7uGAi9MsZ6LkHSdKogJ8nE2DmdC6h6c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fir-zen-25220.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fir-zen-25220",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fir-zen-25220.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1024387307221",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1024387307221:web:82c408feb66c6b89d9f45c"
};

// Initialize Firebase with error handling
const initializeFirebase = (): boolean => {
  try {
    // Validate configuration
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase configuration incomplete - demo mode only');
      return false;
    }

    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    // Set auth domain in development
    if (import.meta.env.DEV && auth) {
      // This helps with local development
      console.log('Firebase initialized for development');
    }
    
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    console.warn('Falling back to demo mode');
    app = null;
    db = null;
    auth = null;
    return false;
  }
};

// Initialize Firebase
const isFirebaseInitialized = initializeFirebase();

// Export Firebase instances with null checks
export { db, auth, isFirebaseInitialized };
export default app;