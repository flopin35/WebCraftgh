/**
 * End-to-end smoke test for custom website request + file uploads.
 * Run: node scripts/custom-flow-test.mjs
 */

import { readFileSync } from 'node:fs';
import { initializeApp } from 'firebase/app';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getSiteUrlFromEnv } from './siteConfig.mjs';

function loadEnv() {
  const env = {};
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

const env = loadEnv();
const LIVE_URL = getSiteUrlFromEnv(env);
const TEST_RECEIPT_ID = `CW-${String(Date.now()).slice(-6)}`;

let passed = 0;
let failed = 0;

function assert(condition, name, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function loadEnv() {
  const env = {};
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
  return env;
}

async function testLiveHosting() {
  console.log('\nLive site (Vercel)');

  const routes = ['/', '/custom-request', '/custom-receipt'];
  for (const route of routes) {
    const response = await fetch(`${LIVE_URL}${route}`);
    assert(response.ok, `${route} returns HTTP ${response.status}`);
  }

  const homeHtml = await (await fetch(`${LIVE_URL}/`)).text();
  assert(homeHtml.includes('WebCraft') || homeHtml.includes('root'), 'Home SPA shell loads');

  const indexHtml = await (await fetch(`${LIVE_URL}/custom-request`)).text();
  const assetMatch = indexHtml.match(/\/assets\/index-[^"]+\.css/);
  assert(Boolean(assetMatch), 'Custom request page references built CSS bundle');

  if (assetMatch) {
    const css = await (await fetch(`${LIVE_URL}${assetMatch[0]}`)).text();
    assert(css.includes('custom-upload-card'), 'Deployed CSS includes upload UI styles');
    assert(css.includes('custom-upload-dropzone'), 'Deployed CSS includes dropzone styles');
  }

  const jsMatch = indexHtml.match(/\/assets\/index-[^"]+\.js/);
  if (jsMatch) {
    const js = await (await fetch(`${LIVE_URL}${jsMatch[0]}`)).text();
    assert(js.includes('customWebsiteRequests'), 'Deployed JS includes Firestore collection name');
    assert(js.includes('Optional Uploads'), 'Deployed JS includes upload section copy');
  }
}

async function testFirestoreSubmission(firebaseConfig) {
  console.log('\nFirestore (custom request submit)');

  const app = initializeApp(firebaseConfig, 'custom-flow-test-firestore');
  const db = getFirestore(app);

  const payload = {
    receiptId: TEST_RECEIPT_ID,
    status: 'Pending Review',
    createdAt: serverTimestamp(),
    customer: {
      fullName: '[AUTOMATED TEST] WebCraft QA',
      phone: '0200000000',
      email: 'qa-test@webcraft-gh.invalid',
      businessName: 'QA Test Business',
      businessType: 'business',
    },
    project: {
      websiteName: 'QA Test Site',
      websitePurpose: 'Automated integration test',
      description: 'This document was created by scripts/custom-flow-test.mjs and can be ignored.',
    },
    selectedPages: ['home', 'contact'],
    selectedFeatures: [],
    uploadedFiles: [],
    estimatedPriceRange: 'GHS 2,000+',
    adminNotes: '',
    requestProgress: '',
    uploadWarnings: [],
  };

  let docId = null;

  try {
    const docRef = await addDoc(collection(db, 'customWebsiteRequests'), payload);
    docId = docRef.id;
    assert(Boolean(docId), `Custom request saved to Firestore (${TEST_RECEIPT_ID})`);
  } catch (error) {
    assert(false, 'Custom request saved to Firestore', error.message);
  }

  return { app, docId };
}

async function testStorageUpload(firebaseConfig) {
  console.log('\nFirebase Storage (file upload)');

  const app = initializeApp(firebaseConfig, 'custom-flow-test-storage');
  const storage = getStorage(app);

  // 1x1 red PNG
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(pngBase64, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });

  const storagePath = `customWebsiteRequests/${TEST_RECEIPT_ID}/logo-test-${Date.now()}.png`;
  const storageRef = ref(storage, storagePath);

  try {
    await uploadBytes(storageRef, blob, { contentType: 'image/png' });
    assert(true, `Logo uploaded to Storage (${storagePath})`);
  } catch (error) {
    assert(false, 'Logo uploaded to Storage', error.message);
  }
}

async function main() {
  console.log('\nWebCraft Custom Flow — Integration Test');
  console.log(`Live URL: ${LIVE_URL}`);
  console.log(`Test receipt: ${TEST_RECEIPT_ID}`);

  const firebaseEnv = loadEnv();
  const firebaseConfig = {
    apiKey: firebaseEnv.VITE_FIREBASE_API_KEY,
    authDomain: firebaseEnv.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: firebaseEnv.VITE_FIREBASE_PROJECT_ID,
    storageBucket: firebaseEnv.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: firebaseEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: firebaseEnv.VITE_FIREBASE_APP_ID,
  };

  assert(Boolean(firebaseConfig.apiKey), 'Firebase config loaded from .env');

  try {
    await testLiveHosting();
    await testFirestoreSubmission(firebaseConfig);
    await testStorageUpload(firebaseConfig);
  } catch (error) {
    failed += 1;
    console.error('\nUnexpected error:', error);
  }

  console.log(`\nResult: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }

  console.log('\nAll custom flow tests passed.');
  console.log(`Check Admin → Custom Requests for receipt ${TEST_RECEIPT_ID}`);
}

main();
