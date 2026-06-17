import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { CUSTOM_REQUEST_COLLECTION } from '../data/customWebsiteOptions';
import { db } from '../firebase';
import { getFriendlyErrorMessage, logError } from '../utils/errors';
import { normalizeTimestamp } from './adminRequestService';

export function mapCustomRequestDocument(docSnap) {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    requestType: 'custom',
    receiptId: data.receiptId ?? '',
    status: data.status ?? 'Pending Review',
    customer: data.customer ?? {},
    websiteGoals: Array.isArray(data.websiteGoals) ? data.websiteGoals : [],
    selectedFeatures: Array.isArray(data.selectedFeatures) ? data.selectedFeatures : [],
    projectDetails: data.projectDetails ?? data.project ?? {},
    budget: data.budget ?? '',
    timeline: data.timeline ?? '',
    leadSummary: data.leadSummary ?? null,
    selectedPages: Array.isArray(data.selectedPages) ? data.selectedPages : [],
    project: data.project ?? {},
    uploadedFiles: Array.isArray(data.uploadedFiles) ? data.uploadedFiles : [],
    uploadWarnings: Array.isArray(data.uploadWarnings) ? data.uploadWarnings : [],
    estimatedPriceRange: data.estimatedPriceRange ?? 'GHS 2,000+',
    adminNotes: data.adminNotes ?? '',
    requestProgress: data.requestProgress ?? '',
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
}

export function subscribeToCustomRequests(onData, onError) {
  if (!db) {
    onError(new Error('Firestore is not initialized.'));
    return () => {};
  }

  const requestsQuery = query(
    collection(db, CUSTOM_REQUEST_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      onData(snapshot.docs.map(mapCustomRequestDocument));
    },
    (error) => {
      logError('AdminCustomRequests', error);
      const message =
        error?.code === 'permission-denied'
          ? 'Permission denied loading custom requests. Sign in as the authorized admin and run npm run deploy:rules if this persists.'
          : error;
      onError(typeof message === 'string' ? new Error(message) : message);
    }
  );
}

export async function updateCustomRequestAdminFields(
  requestId,
  { status, adminNotes, requestProgress }
) {
  if (!db) {
    return {
      success: false,
      error: 'Unable to connect to our servers. Please try again shortly.',
    };
  }

  const updates = {
    updatedAt: serverTimestamp(),
  };

  if (typeof status === 'string') updates.status = status;
  if (typeof adminNotes === 'string') updates.adminNotes = adminNotes;
  if (typeof requestProgress === 'string') updates.requestProgress = requestProgress;

  try {
    await updateDoc(doc(db, CUSTOM_REQUEST_COLLECTION, requestId), updates);
    return { success: true };
  } catch (error) {
    logError('AdminCustomUpdate', error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error, 'Unable to update request. Please try again.'),
    };
  }
}
