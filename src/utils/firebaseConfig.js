import { FIREBASE_DEFAULTS } from '../config/firebase.defaults';

function readEnv(key) {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

export function getFirebaseConfig() {
  return {
    apiKey: readEnv('VITE_FIREBASE_API_KEY') || FIREBASE_DEFAULTS.apiKey,
    authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN') || FIREBASE_DEFAULTS.authDomain,
    projectId: readEnv('VITE_FIREBASE_PROJECT_ID') || FIREBASE_DEFAULTS.projectId,
    storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET') || FIREBASE_DEFAULTS.storageBucket,
    messagingSenderId:
      readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || FIREBASE_DEFAULTS.messagingSenderId,
    appId: readEnv('VITE_FIREBASE_APP_ID') || FIREBASE_DEFAULTS.appId,
  };
}

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();

  return Boolean(
    config.apiKey &&
      config.authDomain &&
      config.projectId &&
      config.appId
  );
}

export function getFirebaseConfigError() {
  if (isFirebaseConfigured()) return null;

  const missing = [];
  const config = getFirebaseConfig();

  if (!config.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!config.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!config.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!config.appId) missing.push('VITE_FIREBASE_APP_ID');

  const hint = import.meta.env.DEV
    ? 'Add values to your .env file and restart the dev server.'
    : 'Add VITE_FIREBASE_* variables in Vercel → Settings → Environment Variables, then redeploy.';

  return `Firebase is not configured. Missing: ${missing.join(', ')}. ${hint}`;
}
