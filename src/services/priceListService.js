import { addDoc, collection, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { PRICE_LIST_DOC } from '../data/builder/builderOptions';
import { DEFAULT_PRICE_LIST } from '../data/builder/defaultPriceList';
import { db } from '../firebase';
import { mergePriceList } from '../utils/builderPricing';
import { logError } from '../utils/errors';
import { withTimeout } from '../utils/requestTimeout';

let cached = null;

/** Load the live price list (Firestore) merged onto the defaults. Never throws. */
export async function loadPriceList({ force = false } = {}) {
  if (cached && !force) return cached;
  if (!db) return { priceList: DEFAULT_PRICE_LIST, source: 'default' };

  try {
    const snap = await withTimeout(getDoc(doc(db, PRICE_LIST_DOC.collection, PRICE_LIST_DOC.id)), 8000, 'timeout');
    if (snap.exists()) {
      const data = snap.data();
      cached = { priceList: mergePriceList(data.priceList ?? {}), source: 'live', updatedAt: data.updatedAt ?? null };
      return cached;
    }
  } catch (error) {
    logError('LoadPriceList', error);
  }
  cached = { priceList: DEFAULT_PRICE_LIST, source: 'default' };
  return cached;
}

/** Admin only (enforced by Firestore rules). Saves the full list and records a history entry. */
export async function savePriceList(priceList, { adminEmail, note = '' } = {}) {
  if (!db) return { success: false, error: 'Database unavailable.' };
  try {
    const nextVersion = (Number(priceList.version) || 1) + 1;
    const payload = { ...priceList, version: nextVersion };
    await setDoc(doc(db, PRICE_LIST_DOC.collection, PRICE_LIST_DOC.id), {
      priceList: payload,
      updatedAt: serverTimestamp(),
      updatedBy: adminEmail ?? '',
    });
    await addDoc(collection(db, 'priceListHistory'), {
      version: nextVersion,
      priceList: payload,
      note: note.slice(0, 500),
      updatedBy: adminEmail ?? '',
      createdAt: serverTimestamp(),
    });
    cached = { priceList: payload, source: 'live' };
    return { success: true, priceList: payload };
  } catch (error) {
    logError('SavePriceList', error);
    return { success: false, error: error?.code === 'permission-denied' ? 'You do not have permission to edit prices.' : 'Unable to save the price list.' };
  }
}
