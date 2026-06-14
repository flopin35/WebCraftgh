import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import {
  ALLOWED_UPLOAD_TYPES,
  BUSINESS_TYPE_IDS,
  CUSTOM_ESTIMATED_PRICE,
  CUSTOM_REQUEST_COLLECTION,
  CUSTOM_STORAGE_PATH,
  featureOptions,
  pageOptions,
} from '../data/customWebsiteOptions';
import { db, getFirebaseConfigError, isFirebaseConfigured, storage } from '../firebase';
import { generateCustomReceiptId, isValidCustomReceiptId } from '../utils/generateCustomReceipt';
import { getFriendlyErrorMessage, logError } from '../utils/errors';
import { sanitizeFormData } from '../utils/inputSanitizer';
import { isAllowedUploadFile, resolveUploadContentType } from '../utils/uploadValidation';
import { withTimeout } from '../utils/requestTimeout';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '../utils/storage';

const TIMEOUT_MESSAGE = 'Request timed out. Please try again.';
const MAX_DESCRIPTION_LENGTH = 5000;

let activeSubmission = false;

const VALID_PAGE_IDS = new Set(pageOptions.map((item) => item.id));
const VALID_FEATURE_IDS = new Set(featureOptions.map((item) => item.id));

function sanitizeCheckboxSelection(selectedIds, validIds) {
  return [...new Set(selectedIds)].filter((id) => validIds.has(id));
}

function sanitizeCustomFormData(formData) {
  const base = sanitizeFormData(formData);

  return {
    ...base,
    businessType: BUSINESS_TYPE_IDS.includes(formData.businessType) ? formData.businessType : '',
    websiteName: (formData.websiteName || '').trim().slice(0, 120),
    websitePurpose: (formData.websitePurpose || '').trim().slice(0, 200),
    projectDescription: (formData.projectDescription || '').trim().slice(0, MAX_DESCRIPTION_LENGTH),
  };
}

export function validateCustomRequest({ formData, selectedPages, selectedFeatures }) {
  const errors = [];
  const data = sanitizeCustomFormData(formData);

  if (!data.fullName) errors.push('Full Name is required.');
  if (!data.phone) errors.push('Phone Number is required.');
  if (!data.email) errors.push('Email Address is required.');
  if (!data.businessName) errors.push('Business / Organization Name is required.');
  if (!data.businessType) errors.push('Business Type is required.');
  if (!data.websiteName) errors.push('Website Name is required.');
  if (!data.websitePurpose) errors.push('Website Purpose is required.');
  if (!data.projectDescription) errors.push('Project description is required.');

  if (selectedPages.length === 0) {
    errors.push('Select at least one page for your website.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedFormData: data,
    selectedPages: sanitizeCheckboxSelection(selectedPages, VALID_PAGE_IDS),
    selectedFeatures: sanitizeCheckboxSelection(selectedFeatures, VALID_FEATURE_IDS),
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
}

export function getLatestCustomRequest() {
  return getFromStorage(STORAGE_KEYS.LATEST_CUSTOM_REQUEST, null);
}

export async function createCustomWebsiteRequest({ formData, selectedPages, selectedFeatures, uploads }) {
  if (activeSubmission) {
    return {
      success: false,
      error: 'Your request is already being submitted. Please wait.',
    };
  }

  const validation = validateCustomRequest({ formData, selectedPages, selectedFeatures });

  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errors.join(' '),
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

  activeSubmission = true;

  let receiptId;

  try {
    receiptId = generateCustomReceiptId();
  } catch (error) {
    activeSubmission = false;
    logError('CustomReceiptGeneration', error);
    return {
      success: false,
      error: 'Unable to generate receipt. Please try again.',
    };
  }

  if (!isValidCustomReceiptId(receiptId)) {
    activeSubmission = false;
    return {
      success: false,
      error: 'Unable to generate receipt. Please try again.',
    };
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

    const payload = {
      receiptId,
      status: 'Pending Review',
      createdAt: serverTimestamp(),
      customer: {
        fullName: validation.sanitizedFormData.fullName,
        phone: validation.sanitizedFormData.phone,
        email: validation.sanitizedFormData.email,
        businessName: validation.sanitizedFormData.businessName,
        businessType: validation.sanitizedFormData.businessType,
      },
      project: {
        websiteName: validation.sanitizedFormData.websiteName,
        websitePurpose: validation.sanitizedFormData.websitePurpose,
        description: validation.sanitizedFormData.projectDescription,
      },
      selectedPages: validation.selectedPages,
      selectedFeatures: validation.selectedFeatures,
      uploadedFiles,
      estimatedPriceRange: CUSTOM_ESTIMATED_PRICE,
      adminNotes: '',
      requestProgress: '',
      uploadWarnings,
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
      project: payload.project,
      selectedPages: payload.selectedPages,
      selectedFeatures: payload.selectedFeatures,
      uploadedFiles: payload.uploadedFiles,
      uploadWarnings: payload.uploadWarnings,
      estimatedPriceRange: payload.estimatedPriceRange,
      firestoreId: docRef.id,
    };

    cacheCustomRequestLocally(cachedRequest);

    return {
      success: true,
      request: cachedRequest,
      warnings: uploadWarnings,
    };
  } catch (error) {
    logError('CustomWebsiteSubmission', error);

    const message =
      error?.code === 'permission-denied'
        ? 'Unable to submit custom request. Please contact support if this continues.'
        : getFriendlyErrorMessage(error, 'Unable to submit custom request. Please try again.');

    return {
      success: false,
      error: message,
    };
  } finally {
    activeSubmission = false;
  }
}
