import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  getFirebaseConfig,
  getFirebaseConfigError,
  isFirebaseConfigured,
} from './utils/firebaseConfig';

const firebaseConfig = getFirebaseConfig();

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[Firebase] Initialized successfully for project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
  }
} else {
  console.error('[Firebase] Configuration error:', getFirebaseConfigError());
}

export { app, auth, db, isFirebaseConfigured, getFirebaseConfigError };
