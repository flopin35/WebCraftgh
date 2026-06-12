const FIREBASE_ERROR_MESSAGES = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Contact support.',
  'auth/user-not-found': 'No account found with those credentials.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/invalid-credential': 'Sign in failed. Please try again.',
  'auth/popup-closed-by-user': 'Sign in was cancelled. Please try again.',
  'auth/popup-blocked': 'Sign in popup was blocked. Please try again — the page will redirect to Google instead.',
  'auth/operation-not-allowed': 'Google sign-in is not enabled for this project. Enable it in Firebase Console → Authentication.',
  'auth/unauthorized-domain': 'This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.',
  'auth/invalid-api-key': 'Firebase API key is invalid. Check your .env configuration.',
  'auth/network-request-failed':
    'Cannot reach Firebase Auth servers. Check your internet, disable VPN/ad blockers, try another browser (Chrome), or switch DNS to 8.8.8.8 / 1.1.1.1.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'permission-denied': 'You do not have permission to perform this action.',
  'unavailable': 'Service is temporarily unavailable. Please try again shortly.',
  'deadline-exceeded': 'The request took too long. Please try again.',
  'resource-exhausted': 'Service is busy. Please try again shortly.',
  'failed-precondition': 'This action cannot be completed right now.',
  'not-found': 'The requested item could not be found.',
  'already-exists': 'This item already exists.',
  'cancelled': 'The request was cancelled.',
  'internal': 'Something went wrong on our end. Please try again.',
  'unauthenticated': 'Please sign in to continue.',
};

export function getFriendlyErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  if (typeof error === 'string') {
    return error;
  }

  const code = error.code || error.name;
  if (code && FIREBASE_ERROR_MESSAGES[code]) {
    return FIREBASE_ERROR_MESSAGES[code];
  }

  if (error.message === 'Request timed out. Please try again.') {
    return error.message;
  }

  if (typeof error.message === 'string' && error.message.includes('CONFIGURATION_NOT_FOUND')) {
    return 'Firebase Authentication is not fully set up. Open Firebase Console → Authentication, click Get Started, then enable Google sign-in.';
  }

  return fallback;
}

export function logError(context, error) {
  console.error(`[${context}]`, error);
}
