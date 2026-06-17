import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import {
  ALLOWED_UPLOAD_TYPES,
  BUDGET_IDS,
  BUSINESS_TYPE_IDS,
  CUSTOM_REQUEST_COLLECTION,
  CUSTOM_STORAGE_PATH,
  FEATURE_IDS,
  TIMELINE_IDS,
  WEBSITE_GOAL_IDS,
} from '../data/customWebsiteOptions';
import { db, getFirebaseConfigError, isFirebaseConfigured, storage } from '../firebase';
import { buildLeadSummary, calculateEstimatedPriceRange } from '../utils/customLeadScoring';
import { isCompleteLeadSummary } from '../utils/leadSummary';
import { generateCustomReceiptId, isValidCustomReceiptId } from '../utils/generateCustomReceipt';
import { getFriendlyErrorMessage, logError } from '../utils/errors';
import { sanitizeFormData } from '../utils/inputSanitizer';
import { isAllowedUploadFile, resolveUploadContentType } from '../utils/uploadValidation';
import { withTimeout } from '../utils/requestTimeout';
import { getFromStorage, removeFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

const TIMEOUT_MESSAGE = 'Request timed out. Please try again.';
const MAX_DESCRIPTION_LENGTH = 5000;

let activeSubmission = false;

function sanitizeSelection(selectedIds, validIds) {
  return [...new Set(selectedIds)].filter((id) => validIds.includes(id));
}

function sanitizeCustomer(formData) {
  const base = sanitizeFormData(formData);

  return {
    fullName: base.fullName,
    phone: base.phone,
    email: base.email,
    businessName: base.businessName,
    businessType: BUSINESS_TYPE_IDS.includes(formData.businessType) ? formData.businessType : '',
  };
}

function sanitizeProjectDetails(projectDetails = {}) {
  return {
    hasLogo: projectDetails.hasLogo || '',
    hasContent: projectDetails.hasContent || '',
    hasDomain: projectDetails.hasDomain || '',
    hasExamples: projectDetails.hasExamples || '',
    exampleNotes: (projectDetails.exampleNotes || '').trim().slice(0, 1000),
    description: (projectDetails.description || '').trim().slice(0, MAX_DESCRIPTION_LENGTH),
  };
}

export function validateWizardStep(wizardState) {
  const errors = [];
  const { step, formData, websiteGoals, projectDetails, budget, timeline } = wizardState;
  const customer = sanitizeCustomer(formData);
  const details = sanitizeProjectDetails(projectDetails);

  if (step === 1) {
    if (!customer.fullName) errors.push('Full name is required.');
    if (!customer.phone) errors.push('Phone number is required.');
    if (!customer.email) errors.push('Email is required.');
    if (!customer.businessName) errors.push('Business name is required.');
    if (!customer.businessType) errors.push('Please select a business type.');
  }

  if (step === 2) {
    if (!websiteGoals.length) errors.push('Select at least one website goal.');
  }

  if (step === 4) {
    if (!details.hasLogo) errors.push('Please answer whether you have a logo.');
    if (!details.hasContent) errors.push('Please answer whether you have content ready.');
    if (!details.hasDomain) errors.push('Please answer whether you own a domain.');
    if (!details.hasExamples) errors.push('Please answer whether you have website examples.');
    if (!details.description) errors.push('Please describe your business and requirements.');
  }

  if (step === 5) {
    if (!BUDGET_IDS.includes(budget)) errors.push('Please select a budget range.');
    if (!TIMELINE_IDS.includes(timeline)) errors.push('Please select a timeline.');
  }

  if (step === 6) {
    const full = validateCustomWizardSubmission(wizardState);
    if (!full.isValid) errors.push(...full.errors);
  }

  return { isValid: errors.length === 0, errors };
}

export function validateCustomWizardSubmission(wizardState) {
  const errors = [];
  const customer = sanitizeCustomer(wizardState.formData);
  const details = sanitizeProjectDetails(wizardState.projectDetails);
  const websiteGoals = sanitizeSelection(wizardState.websiteGoals, WEBSITE_GOAL_IDS);
  const selectedFeatures = sanitizeSelection(wizardState.selectedFeatures, FEATURE_IDS);

  if (!customer.fullName) errors.push('Full name is required.');
  if (!customer.phone) errors.push('Phone number is required.');
  if (!customer.email) errors.push('Email is required.');
  if (!customer.businessName) errors.push('Business name is required.');
  if (!customer.businessType) errors.push('Business type is required.');
  if (!websiteGoals.length) errors.push('Select at least one website goal.');
  if (!details.description) errors.push('Project description is required.');
  if (!BUDGET_IDS.includes(wizardState.budget)) errors.push('Budget is required.');
  if (!TIMELINE_IDS.includes(wizardState.timeline)) errors.push('Timeline is required.');

  return {
    isValid: errors.length === 0,
    errors,
    customer,
    projectDetails: details,
    websiteGoals,
    selectedFeatures,
    budget: wizardState.budget,
    timeline: wizardState.timeline,
  };
}

function validateUploadFile(file, category) {
  const config = ALLOWED_UPLOAD_TYPES[category];
  if (!file || !config) return 'Invalid file.';

  const maxBytes = config.maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return `${config.label} must be ${config.maxSizeMb}MB or less.`;
  }

  return isAllowedUploadFile(file, category, config);
}

async function uploadCustomFiles(receiptId, uploads) {
  if (!storage) {
    return {
      uploadedFiles: [],
      warnings: ['File storage is unavailable. Your request was saved without uploaded files.'],
    };
  }

  const uploadedFiles = [];
  const warnings = [];

  for (const { category, files } of uploads) {
    const config = ALLOWED_UPLOAD_TYPES[category];
    if (!config) continue;

    const fileList = files.slice(0, config.maxFiles);

    for (const file of fileList) {
      const validationError = validateUploadFile(file, category);
      if (validationError) {
        warnings.push(`${file.name}: ${validationError}`);
        continue;
      }

      try {
        const safeName = file.name.replace(/[^\w.\-()+\s]/g, '_').slice(0, 80);
        const storagePath = `${CUSTOM_STORAGE_PATH}/${receiptId}/${category}-${Date.now()}-${safeName}`;
        const storageRef = ref(storage, storagePath);
        const contentType = resolveUploadContentType(file) || 'application/octet-stream';

        await uploadBytes(storageRef, file, { contentType });

        uploadedFiles.push({
          category,
          name: file.name,
          storagePath,
          type: contentType,
          size: file.size,
        });
      } catch (error) {
        logError('CustomFileUpload', error);
        warnings.push(`${file.name}: upload failed. Request will continue without this file.`);
      }
    }
  }

  return { uploadedFiles, warnings };
}

function cacheCustomRequestLocally(request) {
  const existing = getFromStorage(STORAGE_KEYS.CUSTOM_SUBMITTED_REQUESTS, []);
  const updated = Array.isArray(existing) ? [request, ...existing] : [request];

  saveToStorage(STORAGE_KEYS.CUSTOM_SUBMITTED_REQUESTS, updated);
  saveToStorage(STORAGE_KEYS.LATEST_CUSTOM_REQUEST, request);
  removeFromStorage(STORAGE_KEYS.CUSTOM_WIZARD_DRAFT);
}

export function getLatestCustomRequest() {
  return getFromStorage(STORAGE_KEYS.LATEST_CUSTOM_REQUEST, null);
}

export async function createCustomWebsiteRequest({
  formData,
  websiteGoals,
  selectedFeatures,
  projectDetails,
  budget,
  timeline,
  uploads,
}) {
  if (activeSubmission) {
    return { success: false, error: 'Your request is already being submitted. Please wait.' };
  }

  const validation = validateCustomWizardSubmission({
    formData,
    websiteGoals,
    selectedFeatures,
    projectDetails,
    budget,
    timeline,
  });

  if (!validation.isValid) {
    return { success: false, error: validation.errors.join(' ') };
  }

  if (!isFirebaseConfigured()) {
    return { success: false, error: getFirebaseConfigError() };
  }

  if (!db) {
    return { success: false, error: 'Unable to connect to our servers. Please try again shortly.' };
  }

  activeSubmission = true;

  let receiptId;

  try {
    receiptId = generateCustomReceiptId();
  } catch (error) {
    activeSubmission = false;
    logError('CustomReceiptGeneration', error);
    return { success: false, error: 'Unable to generate receipt. Please try again.' };
  }

  if (!isValidCustomReceiptId(receiptId)) {
    activeSubmission = false;
    return { success: false, error: 'Unable to generate receipt. Please try again.' };
  }

  try {
    let uploadWarnings = [];
    let uploadedFiles = [];

    if (uploads?.length) {
      const uploadResult = await withTimeout(
        uploadCustomFiles(receiptId, uploads),
        30000,
        'File upload timed out. Please try again.'
      );
      uploadedFiles = uploadResult.uploadedFiles;
      uploadWarnings = uploadResult.warnings;
    }

    const estimatedPriceRange = calculateEstimatedPriceRange(validation.budget);
    const leadSummary = buildLeadSummary({
      customer: validation.customer,
      websiteGoals: validation.websiteGoals,
      selectedFeatures: validation.selectedFeatures,
      projectDetails: validation.projectDetails,
      budget: validation.budget,
      timeline: validation.timeline,
      estimatedPriceRange,
    });

    if (!isCompleteLeadSummary(leadSummary)) {
      return {
        success: false,
        error: 'Unable to prepare your request. Please check your details and try again.',
      };
    }

    const payload = {
      receiptId,
      status: 'Pending Review',
      createdAt: serverTimestamp(),
      customer: validation.customer,
      websiteGoals: validation.websiteGoals,
      selectedFeatures: validation.selectedFeatures,
      projectDetails: validation.projectDetails,
      budget: validation.budget,
      timeline: validation.timeline,
      uploadedFiles,
      uploadWarnings,
      estimatedPriceRange,
      leadSummary,
      adminNotes: '',
      requestProgress: '',
    };

    const docRef = await withTimeout(
      addDoc(collection(db, CUSTOM_REQUEST_COLLECTION), payload),
      10000,
      TIMEOUT_MESSAGE
    );

    const cachedRequest = {
      receiptId,
      dateSubmitted: new Date().toISOString(),
      status: 'Pending Review',
      customer: payload.customer,
      websiteGoals: payload.websiteGoals,
      selectedFeatures: payload.selectedFeatures,
      projectDetails: payload.projectDetails,
      budget: payload.budget,
      timeline: payload.timeline,
      uploadedFiles: payload.uploadedFiles,
      uploadWarnings: payload.uploadWarnings,
      estimatedPriceRange: payload.estimatedPriceRange,
      leadSummary: payload.leadSummary,
      firestoreId: docRef.id,
    };

    cacheCustomRequestLocally(cachedRequest);

    return { success: true, request: cachedRequest, warnings: uploadWarnings };
  } catch (error) {
    logError('CustomWebsiteSubmission', error);

    const message =
      error?.code === 'permission-denied'
        ? 'Unable to submit custom request. Please contact support if this continues.'
        : getFriendlyErrorMessage(error, 'Unable to submit custom request. Please try again.');

    return { success: false, error: message };
  } finally {
    activeSubmission = false;
  }
}
