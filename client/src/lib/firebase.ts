import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration and initialization
let app: any;
let db: any;
let auth: any;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDx7uGAi9MsZ6LkHSdKogJ8nE2DmdC6h6c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fir-zen-25220.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fir-zen-25220",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fir-zen-25220.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1024387307221",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1024387307221:web:82c408feb66c6b89d9f45c"
};

// Check if we have environment variables (production) or fallback config (development)
const hasEnvConfig = import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID;
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

if (hasValidConfig) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    console.warn('Falling back to demo mode - Firebase authentication will not work');
  }
} else {
  console.warn('Firebase not configured - using demo mode only');
}

export { db, auth };
export default app;