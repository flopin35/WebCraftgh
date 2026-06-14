const STORAGE_PREFIX = 'webcraft_';

export const STORAGE_KEYS = {
  SELECTED_TEMPLATE: 'selectedTemplate',
  SUBMITTED_REQUESTS: 'submittedRequests',
  LATEST_REQUEST: 'latestRequest',
  CUSTOM_SUBMITTED_REQUESTS: 'customSubmittedRequests',
  LATEST_CUSTOM_REQUEST: 'latestCustomRequest',
};

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getFromStorage(key, fallback = null) {
  try {
    const item = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    return true;
  } catch {
    return false;
  }
}
