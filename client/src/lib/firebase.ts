import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Only initialize Firebase if proper environment variables are provided
let app: any;
let db: any;
let auth: any;

// Use environment variables if available, otherwise use provided config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDx7uGAi9MsZ6LkHSdKogJ8nE2DmdC6h6c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fir-zen-25220.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fir-zen-25220",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "fir-zen-25220.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1024387307221",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1024387307221:web:82c408feb66c6b89d9f45c"
};

const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId && 
                      !firebaseConfig.apiKey.includes('demo');

if (hasValidConfig) {

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization failed:', error);
  }
} else {
  console.warn('Firebase not configured - using demo mode only');
}

export { db, auth };
export default app;