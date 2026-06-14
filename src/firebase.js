import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import {
  getFirebaseConfig,
  getFirebaseConfigError,
  isFirebaseConfigured,
} from './utils/firebaseConfig';

const firebaseConfig = getFirebaseConfig();

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    try {
      storage = getStorage(app);
    } catch (storageError) {
      console.error('[Firebase Storage] Initialization failed:', storageError);
    }

    console.log('[Firebase] Initialized successfully for project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error);
  }
} else {
  console.error('[Firebase] Configuration error:', getFirebaseConfigError());
}

export { app, auth, db, storage, isFirebaseConfigured, getFirebaseConfigError };
