import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { BUILDER_COLLECTION, BUILDER_REPLY_COLLECTION, BUILDER_STATUS_COLLECTION } from '../data/builder/builderOptions';
import { auth, db } from '../firebase';
import { logError } from '../utils/errors';
import { normalizeTimestamp } from './adminRequestService';

export function subscribeToBuilderRequests(onData, onError) {
  if (!db) {
    onError(new Error('Firestore is not initialized.'));
    return () => {};
  }
  return onSnapshot(
    query(collection(db, BUILDER_COLLECTION), orderBy('createdAt', 'desc')),
    (snapshot) =>
      onData(
        snapshot.docs.map((snap) => {
          const data = snap.data();
          return {
            id: snap.id,
            ...data,
            quoteHistory: Array.isArray(data.quoteHistory) ? data.quoteHistory : [],
            clarifications: Array.isArray(data.clarifications) ? data.clarifications : [],
            uploadedFiles: Array.isArray(data.uploadedFiles) ? data.uploadedFiles : [],
            createdAt: normalizeTimestamp(data.createdAt),
          };
        })
      ),
    (error) => {
      logError('AdminBuilderRequests', error);
      onError(error);
    }
  );
}

export function subscribeToCustomerReplies(onData) {
  if (!db) return () => {};
  return onSnapshot(
    query(collection(db, BUILDER_REPLY_COLLECTION), orderBy('createdAt', 'desc')),
    (snapshot) => onData(snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data(), createdAt: normalizeTimestamp(snap.data().createdAt) }))),
    (error) => logError('AdminReplies', error)
  );
}

const adminEmail = () => auth?.currentUser?.email ?? 'admin';

/**
 * Update a request. Every quote change is appended to quoteHistory (audit trail).
 * The public status document is kept in sync (status + customer-facing message + quote only).
 */
export async function updateBuilderRequest(request, { status, adminNotes, quote, clarification, customerMessage }) {
  try {
    const batch = writeBatch(db);
    const requestRef = doc(db, BUILDER_COLLECTION, request.id);
    const statusRef = doc(db, BUILDER_STATUS_COLLECTION, request.id);
    const at = new Date().toISOString();
    const updates = { updatedAt: serverTimestamp() };
    const statusUpdates = { updatedAt: serverTimestamp() };

    if (status) {
      updates.status = status;
      statusUpdates.status = status;
    }
    if (typeof adminNotes === 'string') updates.adminNotes = adminNotes.slice(0, 5000);

    if (quote) {
      const amount = Math.round(Number(quote.amount));
      if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: 'Enter a valid quotation amount.' };
      const entry = {
        amount,
        previousAmount: request.quote?.amount ?? request.estimate?.amount ?? null,
        reason: String(quote.reason ?? '').slice(0, 1000),
        validUntil: String(quote.validUntil ?? '').slice(0, 20),
        terms: String(quote.terms ?? '').slice(0, 3000),
        by: adminEmail(),
        at,
      };
      updates.quote = { amount, validUntil: entry.validUntil, terms: entry.terms, sentAt: quote.send ? at : request.quote?.sentAt ?? null };
      updates.quoteHistory = arrayUnion(entry);
      if (quote.send) {
        updates.status = 'Quotation Sent';
        statusUpdates.status = 'Quotation Sent';
        statusUpdates.quote = { amount, validUntil: entry.validUntil, terms: entry.terms, sentAt: at };
      }
    }

    if (clarification) {
      const text = String(clarification).slice(0, 2000);
      updates.clarifications = arrayUnion({ question: text, at, by: adminEmail() });
      updates.status = 'Needs Information';
      statusUpdates.status = 'Needs Information';
      statusUpdates.customerMessage = text;
    }
    if (typeof customerMessage === 'string' && !clarification) statusUpdates.customerMessage = customerMessage.slice(0, 2000);

    batch.update(requestRef, updates);
    batch.update(statusRef, statusUpdates);
    await batch.commit();
    return { success: true };
  } catch (error) {
    logError('UpdateBuilderRequest', error);
    return { success: false, error: error?.code === 'permission-denied' ? 'Permission denied.' : 'Unable to save changes.' };
  }
}

export async function markReplyHandled(replyId) {
  try {
    await updateDoc(doc(db, BUILDER_REPLY_COLLECTION, replyId), { handled: true });
    return { success: true };
  } catch (error) {
    logError('MarkReplyHandled', error);
    return { success: false };
  }
}
