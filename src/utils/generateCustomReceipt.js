import { getFromStorage, STORAGE_KEYS } from './storage';

const CUSTOM_RECEIPT_PATTERN = /^CW-[0-9]{6}$/;

function generateSixDigits() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getExistingCustomReceiptIds() {
  const requests = getFromStorage(STORAGE_KEYS.CUSTOM_SUBMITTED_REQUESTS, []);

  if (!Array.isArray(requests)) {
    return new Set();
  }

  return new Set(requests.map((request) => request.receiptId).filter(Boolean));
}

export function isValidCustomReceiptId(receiptId) {
  return typeof receiptId === 'string' && CUSTOM_RECEIPT_PATTERN.test(receiptId);
}

export function generateCustomReceiptId() {
  const existingIds = getExistingCustomReceiptIds();
  let receiptId = '';
  let attempts = 0;
  const maxAttempts = 100;

  do {
    receiptId = `CW-${generateSixDigits()}`;
    attempts += 1;
  } while (existingIds.has(receiptId) && attempts < maxAttempts);

  if (existingIds.has(receiptId)) {
    receiptId = `CW-${Date.now().toString().slice(-6)}`;
  }

  if (!isValidCustomReceiptId(receiptId)) {
    throw new Error('Unable to generate a valid custom receipt ID.');
  }

  return receiptId;
}
