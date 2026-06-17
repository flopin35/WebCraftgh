import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { REQUEST_COLLECTION } from '../constants/requestStatuses';
import { auth, db } from '../firebase';
import { isAuthorizedAdminEmail } from './adminAuthService';
import { getFriendlyErrorMessage, logError } from '../utils/errors';

export function normalizeTimestamp(value) {
  if (!value) return null;

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

export function mapRequestDocument(docSnap) {
  const data = docSnap.data();

  return {
    id: docSnap.id,
    receiptId: data.receiptId ?? '',
    status: data.status ?? 'Pending Review',
    customer: data.customer ?? {},
    template: data.template ?? {},
    deployment: Boolean(data.deployment),
    selectedUpgrades: Array.isArray(data.selectedUpgrades)
      ? data.selectedUpgrades
      : Array.isArray(data.selectedFeatures)
        ? data.selectedFeatures
        : [],
    selectedFeatures: Array.isArray(data.selectedFeatures) ? data.selectedFeatures : [],
    selectedBundle: data.selectedBundle ?? null,
    pricing: data.pricing ?? null,
    totalPrice: data.totalPrice ?? 0,
    notes: data.notes ?? '',
    adminNotes: data.adminNotes ?? '',
    requestProgress: data.requestProgress ?? '',
    websiteTypeId: data.websiteTypeId ?? '',
    leadSummary: data.leadSummary ?? null,
    createdAt: normalizeTimestamp(data.createdAt),
    updatedAt: normalizeTimestamp(data.updatedAt),
  };
}

export function subscribeToRequests(onData, onError) {
  if (!db) {
    onError(new Error('Firestore is not initialized.'));
    return () => {};
  }

  const requestsQuery = query(
    collection(db, REQUEST_COLLECTION),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    requestsQuery,
    (snapshot) => {
      onData(snapshot.docs.map(mapRequestDocument));
    },
    (error) => {
      logError('AdminRequests', error);
      const message =
        error?.code === 'permission-denied'
          ? 'Permission denied loading requests. Sign in as the authorized admin and run npm run deploy:rules if this persists.'
          : error;
      onError(typeof message === 'string' ? new Error(message) : message);
    }
  );
}

export async function updateRequestAdminFields(requestId, { status, adminNotes, requestProgress }) {
  if (!db) {
    return {
      success: false,
      error: 'Unable to connect to our servers. Please try again shortly.',
    };
  }

  const updates = {
    updatedAt: serverTimestamp(),
  };

  if (typeof status === 'string') {
    updates.status = status;
  }

  if (typeof adminNotes === 'string') {
    updates.adminNotes = adminNotes;
  }

  if (typeof requestProgress === 'string') {
    updates.requestProgress = requestProgress;
  }

  try {
    await updateDoc(doc(db, REQUEST_COLLECTION, requestId), updates);
    return { success: true };
  } catch (error) {
    logError('AdminUpdate', error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error, 'Unable to update request. Please try again.'),
    };
  }
}

export async function testFirestoreConnection() {
  if (!db) {
    return { success: false, message: 'Firestore is not initialized.' };
  }

  const user = auth?.currentUser;

  if (!user) {
    return {
      success: true,
      message: 'Firestore client ready. Sign in as admin to verify database read access.',
    };
  }

  if (!isAuthorizedAdminEmail(user.email)) {
    return {
      success: false,
      message: 'Signed-in account is not authorized for admin Firestore access.',
    };
  }

  try {
    await user.getIdToken();

    const requestsQuery = query(collection(db, REQUEST_COLLECTION), limit(1));
    await getDocs(requestsQuery);
    return { success: true, message: 'Firestore connected and admin read access verified.' };
  } catch (error) {
    logError('FirestoreTest', error);

    if (error?.code === 'permission-denied') {
      return {
        success: false,
        message:
          'Firestore denied read access. Deploy firestore.rules with npm run deploy:rules and sign in as the authorized admin.',
      };
    }

    return {
      success: false,
      message: getFriendlyErrorMessage(error, 'Unable to connect to Firestore.'),
    };
  }
}
