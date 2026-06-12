import { getFromStorage, STORAGE_KEYS } from './storage';

const RECEIPT_ID_PATTERN = /^REQ-[0-9]{6}$/;

function generateSixDigits() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getExistingReceiptIds() {
  const requests = getFromStorage(STORAGE_KEYS.SUBMITTED_REQUESTS, []);

  if (!Array.isArray(requests)) {
    return new Set();
  }

  return new Set(requests.map((request) => request.receiptId).filter(Boolean));
}

export function isValidReceiptId(receiptId) {
  return typeof receiptId === 'string' && RECEIPT_ID_PATTERN.test(receiptId);
}

export function generateReceiptId() {
  const existingIds = getExistingReceiptIds();
  let receiptId = '';
  let attempts = 0;
  const maxAttempts = 100;

  do {
    receiptId = `REQ-${generateSixDigits()}`;
    attempts += 1;
  } while (existingIds.has(receiptId) && attempts < maxAttempts);

  if (existingIds.has(receiptId)) {
    receiptId = `REQ-${Date.now().toString().slice(-6)}`;
  }

  if (!isValidReceiptId(receiptId)) {
    throw new Error('Unable to generate a valid receipt ID.');
  }

  return receiptId;
}
