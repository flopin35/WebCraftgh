import { existsSync, readFileSync } from 'node:fs';

const REQUIRED_VARS = ['VITE_ADMIN_EMAIL'];

const FIREBASE_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

function loadEnvFile() {
  const env = { ...process.env };

  if (!existsSync('.env')) {
    return env;
  }

  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match && !env[match[1].trim()]) {
      env[match[1].trim()] = match[2].trim();
    }
  }

  return env;
}

const env = loadEnvFile();
const missing = REQUIRED_VARS.filter((key) => !env[key]?.trim());

if (missing.length) {
  console.error('\nBuild warning: missing environment variables:\n');
  missing.forEach((key) => console.error(`  - ${key}`));
  console.error('\nUsing committed Firebase defaults for client config.\n');
}

const missingFirebase = FIREBASE_VARS.filter((key) => !env[key]?.trim());
if (missingFirebase.length) {
  console.log(`Firebase env overrides not set (${missingFirebase.length}); using src/config/firebase.defaults.js`);
}

console.log('Environment variables verified for production build.');
