import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import {
  BUILDER_COLLECTION,
  BUILDER_REPLY_COLLECTION,
  BUILDER_STATUS_COLLECTION,
  BUILDER_STORAGE_PATH,
  BUILDER_UPLOADS,
  CONTACT_METHODS,
  TIMELINE_OPTIONS,
} from '../data/builder/builderOptions';
import { db, getFirebaseConfigError, isFirebaseConfigured, storage } from '../firebase';
import { buildBriefText, buildCustomEstimateBrief, buildSpec, findMissingContent } from '../utils/builderBrief';
import { calculateEstimate } from '../utils/builderPricing';
import { validateBuilderStep, validateCustomEstimate } from '../utils/builderValidation';
import { getFriendlyErrorMessage, logError } from '../utils/errors';
import { withTimeout } from '../utils/requestTimeout';
import { getFromStorage, saveToStorage } from '../utils/storage';
import { isAllowedUploadFile, resolveUploadContentType } from '../utils/uploadValidation';

export const PRIVACY_NOTICE_VERSION = '2026-10';
export const REFERENCE_PATTERN = /^(WB|CE)-[A-Z0-9]{8}$/;
const LATEST_KEY = 'latestBuilderRequest';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

let activeSubmission = false;

export function generateReference(prefix) {
  const bytes = new Uint8Array(8);
  (globalThis.crypto ?? window.crypto).getRandomValues(bytes);
  return `${prefix}-${[...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('').padEnd(8, '2')}`;
}

const clip = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const pickId = (value, list, fallback) => (list.some((item) => item.id === value) ? value : fallback);

function sanitizeCustomer(source) {
  return {
    fullName: clip(source.fullName, 120),
    businessName: clip(source.businessName, 120),
    email: clip(source.email, 120).toLowerCase(),
    phone: clip(source.phone, 30),
    contactMethod: pickId(source.contactMethod, CONTACT_METHODS, 'email'),
    timeline: pickId(source.timeline, TIMELINE_OPTIONS, ''),
  };
}

async function uploadFiles(receiptId, uploads) {
  const uploadedFiles = [];
  const warnings = [];
  const entries = Object.entries(uploads ?? {}).filter(([, files]) => files?.length);
  if (!entries.length) return { uploadedFiles, warnings };
  if (!storage) return { uploadedFiles, warnings: ['File storage is unavailable — your brief was saved without files.'] };

  for (const [category, files] of entries) {
    const config = BUILDER_UPLOADS[category];
    if (!config) continue;
    for (const file of files.slice(0, config.maxFiles)) {
      if (file.size > config.maxSizeMb * 1024 * 1024) {
        warnings.push(`${file.name}: larger than ${config.maxSizeMb}MB, skipped.`);
        continue;
      }
      const typeError = isAllowedUploadFile(file, category, config);
      if (typeError) {
        warnings.push(`${file.name}: ${typeError}`);
        continue;
      }
      try {
        const safeName = file.name.replace(/[^\w.\-()+\s]/g, '_').slice(0, 80);
        const storagePath = `${BUILDER_STORAGE_PATH}/${receiptId}/${category}-${Date.now()}-${safeName}`;
        const contentType = resolveUploadContentType(file) || 'application/octet-stream';
        await uploadBytes(ref(storage, storagePath), file, { contentType });
        uploadedFiles.push({ category, name: file.name.slice(0, 120), storagePath, type: contentType, size: file.size });
      } catch (error) {
        logError('BuilderUpload', error);
        warnings.push(`${file.name}: upload failed.`);
      }
    }
  }
  return { uploadedFiles, warnings };
}

async function writeRequest(receiptId, payload) {
  await withTimeout(setDoc(doc(db, BUILDER_COLLECTION, receiptId), payload), 12000, 'Request timed out. Please try again.');
  await withTimeout(
    setDoc(doc(db, BUILDER_STATUS_COLLECTION, receiptId), {
      receiptId,
      requestKind: payload.requestKind,
      status: 'Pending Review',
      customerMessage: '',
      quote: null,
      updatedAt: serverTimestamp(),
    }),
    10000,
    'Request timed out. Please try again.'
  );
}

function preflight() {
  if (activeSubmission) return 'Your request is already being submitted. Please wait.';
  if (!isFirebaseConfigured()) return getFirebaseConfigError();
  if (!db) return 'Unable to connect to our servers. Please try again shortly.';
  return null;
}

function friendly(error) {
  logError('BuilderSubmission', error);
  return error?.code === 'permission-denied'
    ? 'Your brief could not be accepted. Please check your details and try again, or contact us on WhatsApp.'
    : getFriendlyErrorMessage(error, 'Unable to submit right now. Your progress is saved — please try again.');
}

/** Submit the full builder brief. Uses the supplied price list so the estimate matches what the customer saw. */
export async function submitBuilderRequest({ state, uploads, priceList }) {
  for (const stepId of ['budget', 'type', 'pages', 'branding', 'text', 'summary', 'details']) {
    const result = validateBuilderStep(stepId, state);
    if (!result.isValid) return { success: false, error: result.errors.join(' ') };
  }
  const blocked = preflight();
  if (blocked) return { success: false, error: blocked };

  activeSubmission = true;
  const receiptId = generateReference('WB');
  try {
    const pricing = calculateEstimate(state, priceList);
    const spec = buildSpec(state, pricing);
    const customer = sanitizeCustomer(state.customer);
    const missingContent = findMissingContent(state);
    const estimate = {
      amount: pricing.estimate,
      low: pricing.range.low,
      high: pricing.range.high,
      subtotal: pricing.subtotal,
      bundleDiscount: pricing.bundleDiscount,
      overBudget: pricing.budget.overBudget,
      overBudgetAcknowledged: Boolean(state.overBudgetAcknowledged),
      exceedsBuilderCap: pricing.exceedsBuilderCap,
      needsManualReview: pricing.needsManualReview,
      lineItems: pricing.lineItems.slice(0, 120).map(({ category, label, amount }) => ({ category, label: label.slice(0, 200), amount })),
      manualReview: pricing.manualReview.slice(0, 30).map(({ label, reason }) => ({ label: label.slice(0, 200), reason: reason.slice(0, 300) })),
      recurring: pricing.recurring.map(({ label, amount, period }) => ({ label, amount, period })),
      autoAdded: pricing.autoAdded.map(({ label, reason }) => ({ label, reason })),
      priceListVersion: Number(pricing.priceListVersion) || 1,
    };

    const { uploadedFiles, warnings } = await withTimeout(uploadFiles(receiptId, uploads), 60000, 'File upload timed out. Please try again.');
    const brief = buildBriefText({ receiptId, spec, estimate, customer, missingContent }).slice(0, 20000);

    const payload = {
      receiptId,
      requestKind: 'builder',
      status: 'Pending Review',
      createdAt: serverTimestamp(),
      customer,
      consent: { accepted: true, noticeVersion: PRIVACY_NOTICE_VERSION },
      websiteType: spec.websiteType,
      budgetAmount: spec.budget.amount,
      budgetTier: spec.budget.tier,
      spec,
      estimate,
      missingContent: missingContent.slice(0, 20),
      brief,
      uploadedFiles,
      uploadWarnings: warnings.slice(0, 20),
      adminNotes: '',
      quote: null,
      quoteHistory: [],
      clarifications: [],
    };

    await writeRequest(receiptId, payload);
    const summary = { receiptId, requestKind: 'builder', estimate, customer, brief, warnings, submittedAt: new Date().toISOString() };
    saveToStorage(LATEST_KEY, summary);
    return { success: true, request: summary };
  } catch (error) {
    return { success: false, error: friendly(error) };
  } finally {
    activeSubmission = false;
  }
}

export async function submitCustomEstimate({ data, uploads, origin = 'direct' }) {
  const validation = validateCustomEstimate(data);
  if (!validation.isValid) return { success: false, error: validation.errors.join(' ') };
  const blocked = preflight();
  if (blocked) return { success: false, error: blocked };

  activeSubmission = true;
  const receiptId = generateReference('CE');
  try {
    const customer = sanitizeCustomer({ ...data, timeline: '' });
    const clean = {
      description: clip(data.description, 5000),
      functionality: clip(data.functionality, 5000),
      budgetRange: clip(data.budgetRange, 80),
      completionDate: clip(data.completionDate, 20),
      origin: origin === 'builder' ? 'builder' : 'direct',
    };
    const { uploadedFiles, warnings } = await withTimeout(uploadFiles(receiptId, uploads), 60000, 'File upload timed out. Please try again.');
    const brief = buildCustomEstimateBrief({ receiptId, data: { ...clean, ...customer } }).slice(0, 20000);

    const payload = {
      receiptId,
      requestKind: 'custom-estimate',
      status: 'Pending Review',
      createdAt: serverTimestamp(),
      customer,
      consent: { accepted: true, noticeVersion: PRIVACY_NOTICE_VERSION },
      websiteType: 'other',
      budgetAmount: 0,
      budgetTier: clean.budgetRange || 'Not specified',
      customEstimate: clean,
      brief,
      uploadedFiles,
      uploadWarnings: warnings.slice(0, 20),
      adminNotes: '',
      quote: null,
      quoteHistory: [],
      clarifications: [],
    };
    await writeRequest(receiptId, payload);
    const summary = { receiptId, requestKind: 'custom-estimate', customer, brief, warnings, submittedAt: new Date().toISOString() };
    saveToStorage(LATEST_KEY, summary);
    return { success: true, request: summary };
  } catch (error) {
    return { success: false, error: friendly(error) };
  } finally {
    activeSubmission = false;
  }
}

export const getLatestBuilderRequest = () => getFromStorage(LATEST_KEY, null);

/** Public status lookup by reference number (status docs hold no personal data). */
export async function fetchRequestStatus(reference) {
  const receiptId = clip(reference, 20).toUpperCase();
  if (!REFERENCE_PATTERN.test(receiptId)) return { success: false, error: 'That reference number does not look right (e.g. WB-7K2M9QXA).' };
  if (!db) return { success: false, error: 'Unable to connect right now.' };
  try {
    const snap = await withTimeout(getDoc(doc(db, BUILDER_STATUS_COLLECTION, receiptId)), 10000, 'Request timed out.');
    if (!snap.exists()) return { success: false, error: 'We could not find a request with that reference.' };
    return { success: true, status: snap.data() };
  } catch (error) {
    logError('FetchStatus', error);
    return { success: false, error: 'Unable to load the status. Please try again.' };
  }
}

/** Customer reply: clarification answer, quote acceptance or decline. */
export async function sendCustomerReply({ receiptId, type, message }) {
  if (!REFERENCE_PATTERN.test(receiptId)) return { success: false, error: 'Invalid reference.' };
  if (!['message', 'accept-quote', 'decline-quote'].includes(type)) return { success: false, error: 'Invalid reply.' };
  const text = clip(message, 3000);
  if (type === 'message' && text.length < 2) return { success: false, error: 'Write a short message first.' };
  try {
    await withTimeout(
      addDoc(collection(db, BUILDER_REPLY_COLLECTION), { receiptId, type, message: text, createdAt: serverTimestamp(), handled: false }),
      10000,
      'Request timed out.'
    );
    return { success: true };
  } catch (error) {
    logError('CustomerReply', error);
    return { success: false, error: 'Unable to send your reply. Please try again.' };
  }
}
