import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  const isEmulatorConnected = {
    auth: false,
    storage: false,
    firestore: false
  };

  // Connect Auth emulator
  if (!isEmulatorConnected.auth) {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      isEmulatorConnected.auth = true;
      console.log('Connected to Auth emulator');
    } catch (error) {
      console.warn('Failed to connect to Auth emulator:', error);
    }
  }

  // Connect Storage emulator
  if (!isEmulatorConnected.storage) {
    try {
      connectStorageEmulator(storage, 'localhost', 9199);
      isEmulatorConnected.storage = true;
      console.log('Connected to Storage emulator');
    } catch (error) {
      console.warn('Failed to connect to Storage emulator:', error);
    }
  }

  // Connect Firestore emulator
  if (!isEmulatorConnected.firestore) {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      isEmulatorConnected.firestore = true;
      console.log('Connected to Firestore emulator');
    } catch (error) {
      console.warn('Failed to connect to Firestore emulator:', error);
    }
  }
}

export default app;