import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { REQUEST_COLLECTION } from '../constants/requestStatuses';
import { getBundleById } from '../data/upgrades';
import { getWebsiteTypeById } from '../data/templateCatalog';
import { db, getFirebaseConfigError, isFirebaseConfigured } from '../firebase';
import { getFriendlyErrorMessage, logError } from '../utils/errors';
import { getTemplateById } from '../services/templateService';
import { generateReceiptId, isValidReceiptId } from '../utils/generateReceipt';
import { sanitizeRequestInput } from '../utils/inputSanitizer';
import { buildSelectedUpgradesList } from '../utils/pricing';
import { withTimeout } from '../utils/requestTimeout';
import { resolveSecureRequestData } from '../utils/securePricing';
import { buildTemplateLeadSummary } from '../utils/templateLeadScoring';
import { isCompleteLeadSummary } from '../utils/leadSummary';
import {
  buildSubmissionFingerprint,
  clearSubmissionLock,
  isDuplicateSubmission,
  markSubmissionStarted,
} from '../utils/submissionLock';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

const COLLECTION_NAME = REQUEST_COLLECTION;
const TIMEOUT_MESSAGE = 'Request timed out. Please try again.';

let activeSubmission = false;

export function validateRequest({ template, formData }) {
  const errors = [];

  if (!formData.fullName?.trim()) {
    errors.push('Full Name is required.');
  }

  if (!formData.phone?.trim()) {
    errors.push('Phone Number is required.');
  }

  if (!formData.businessName?.trim()) {
    errors.push('Business Name is required.');
  }

  if (!template?.id || !template?.name) {
    errors.push('Template is required.');
  }

  if (template?.id && !getTemplateById(template.id)) {
    errors.push('Invalid template selected. Please choose a template and try again.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTemplateWizardStep(state) {
  const errors = [];
  const { step, websiteTypeId, packageId, formData } = state;

  if (step >= 1 && !websiteTypeId) {
    errors.push('Please select a website type.');
  }

  if (step >= 2) {
    if (!getWebsiteTypeById(websiteTypeId)) {
      errors.push('Please select a valid website type.');
    }
    if (!packageId || !getTemplateById(packageId)) {
      errors.push('Please select a package.');
    }
  }

  if (step >= 5) {
    if (!formData.fullName?.trim()) errors.push('Full name is required.');
    if (!formData.phone?.trim()) errors.push('Phone number is required.');
    if (!formData.email?.trim()) errors.push('Email is required.');
    if (!formData.businessName?.trim()) errors.push('Business name is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function buildFirestorePayload({
  template,
  formData,
  selectedUpgradeIds,
  selectedBundleId,
  includeDeployment,
  pricing,
  receiptId,
  websiteTypeId,
  leadSummary,
}) {
  const selectedBundle = selectedBundleId ? getBundleById(selectedBundleId) : null;

  const payload = {
    receiptId,
    status: 'Pending Review',
    createdAt: serverTimestamp(),
    customer: {
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      email: formData.email?.trim() ?? '',
      businessName: formData.businessName.trim(),
    },
    template: {
      id: template.id,
      name: template.name,
      price: template.price,
    },
    selectedUpgrades: buildSelectedUpgradesList(selectedUpgradeIds, selectedBundleId),
    selectedBundle: selectedBundle
      ? { id: selectedBundle.id, name: selectedBundle.name, price: selectedBundle.price }
      : null,
    selectedFeatures: buildSelectedUpgradesList(selectedUpgradeIds, selectedBundleId),
    deployment: includeDeployment,
    pricing: {
      templatePrice: pricing.templatePrice,
      upgradesSubtotal: pricing.upgradesSubtotal,
      bundleDiscount: pricing.bundleDiscount,
      deploymentFee: pricing.deploymentFee,
      total: pricing.total,
    },
    totalPrice: pricing.total,
    notes: formData.additionalNotes?.trim() ?? '',
    adminNotes: '',
    requestProgress: '',
    websiteTypeId: websiteTypeId || '',
    leadSummary,
  };

  return payload;
}

function cacheRequestLocally(request) {
  const existingRequests = getFromStorage(STORAGE_KEYS.SUBMITTED_REQUESTS, []);
  const updatedRequests = Array.isArray(existingRequests)
    ? [request, ...existingRequests]
    : [request];

  saveToStorage(STORAGE_KEYS.SUBMITTED_REQUESTS, updatedRequests);
  saveToStorage(STORAGE_KEYS.LATEST_REQUEST, request);
}

export async function createRequest(rawInput) {
  const requestInput = sanitizeRequestInput(rawInput);
  const validation = validateRequest(requestInput);

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(' '),
    };
  }

  if (activeSubmission) {
    return {
      success: false,
      error: 'Your request is already being submitted. Please wait.',
    };
  }

  const fingerprint = buildSubmissionFingerprint(requestInput);

  if (isDuplicateSubmission(fingerprint)) {
    return {
      success: false,
      error: 'This request was already submitted. Please check your receipt.',
    };
  }

  if (!isFirebaseConfigured()) {
    return {
      success: false,
      error: getFirebaseConfigError(),
    };
  }

  if (!db) {
    return {
      success: false,
      error: 'Unable to connect to our servers. Please try again shortly.',
    };
  }

  const secureData = resolveSecureRequestData(requestInput);

  if (!secureData.success) {
    return {
      success: false,
      error: secureData.error,
    };
  }

  const leadSummary = buildTemplateLeadSummary({
    customer: requestInput.formData,
    websiteTypeId: requestInput.websiteTypeId,
    template: secureData.template,
    selectedUpgradeIds: secureData.selectedUpgradeIds,
    selectedBundleId: secureData.selectedBundleId,
    pricing: secureData.pricing,
  });

  if (!isCompleteLeadSummary(leadSummary)) {
    return {
      success: false,
      error: 'Unable to prepare your request. Please check your details and try again.',
    };
  }

  activeSubmission = true;
  markSubmissionStarted(fingerprint);

  let receiptId;

  try {
    receiptId = generateReceiptId();
  } catch (error) {
    activeSubmission = false;
    clearSubmissionLock();
    logError('ReceiptGeneration', error);
    return {
      success: false,
      error: 'Unable to generate receipt. Please try again.',
    };
  }

  if (!isValidReceiptId(receiptId)) {
    activeSubmission = false;
    clearSubmissionLock();
    return {
      success: false,
      error: 'Unable to generate receipt. Please try again.',
    };
  }

  const firestorePayload = buildFirestorePayload({
    template: secureData.template,
    formData: requestInput.formData,
    selectedUpgradeIds: secureData.selectedUpgradeIds,
    selectedBundleId: secureData.selectedBundleId,
    includeDeployment: secureData.includeDeployment,
    pricing: secureData.pricing,
    receiptId,
    websiteTypeId: requestInput.websiteTypeId,
    leadSummary,
  });

  try {
    const docRef = await withTimeout(
      addDoc(collection(db, COLLECTION_NAME), firestorePayload),
      10000,
      TIMEOUT_MESSAGE
    );

    const cachedRequest = {
      receiptId,
      dateSubmitted: new Date().toISOString(),
      status: 'Pending Review',
      customer: firestorePayload.customer,
      template: firestorePayload.template,
      websiteTypeId: firestorePayload.websiteTypeId,
      selectedUpgrades: firestorePayload.selectedUpgrades,
      selectedBundle: firestorePayload.selectedBundle,
      selectedFeatures: firestorePayload.selectedFeatures,
      deployment: firestorePayload.deployment,
      pricing: firestorePayload.pricing,
      totalPrice: firestorePayload.totalPrice,
      notes: firestorePayload.notes,
      leadSummary: firestorePayload.leadSummary,
      firestoreId: docRef.id,
    };

    cacheRequestLocally(cachedRequest);

    return {
      success: true,
      request: cachedRequest,
    };
  } catch (error) {
    logError('RequestSubmission', error);
    clearSubmissionLock();

    return {
      success: false,
      error: getFriendlyErrorMessage(error, 'Unable to submit request. Please try again.'),
    };
  } finally {
    activeSubmission = false;
  }
}

export async function submitRequest(requestInput) {
  return createRequest(requestInput);
}

export function getSubmittedRequests() {
  return getFromStorage(STORAGE_KEYS.SUBMITTED_REQUESTS, []);
}

export function getLatestRequest() {
  return getFromStorage(STORAGE_KEYS.LATEST_REQUEST, null);
}
