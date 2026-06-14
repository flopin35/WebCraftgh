import {
  browserLocalPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { ADMIN_EMAIL } from '../constants/admin';
import { auth, getFirebaseConfigError } from '../firebase';
import { getFriendlyErrorMessage, logError } from '../utils/errors';

const ADMIN_RETURN_KEY = 'webcraft_admin_return_path';
const ADMIN_DASHBOARD_PATH = '/admin';
const LOG_PREFIX = '[AdminAuth]';

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

let redirectResultPromise = null;
let persistenceReadyPromise = null;

function logAuth(message, detail) {
  if (!import.meta.env.DEV) return;

  if (detail !== undefined) {
    console.log(`${LOG_PREFIX} ${message}`, detail);
  } else {
    console.log(`${LOG_PREFIX} ${message}`);
  }
}

function ensureAuthPersistence() {
  if (!auth) {
    return Promise.resolve();
  }

  if (!persistenceReadyPromise) {
    persistenceReadyPromise = setPersistence(auth, browserLocalPersistence).catch((error) => {
      logError('AdminAuthPersistence', error);
    });
  }

  return persistenceReadyPromise;
}

export function isAuthorizedAdminEmail(email) {
  return typeof email === 'string' && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

async function handleUnauthorizedUser(email) {
  logAuth('Unauthorized Access', email);
  if (!auth) return;
  await signOut(auth);
}

function buildAuthState(user, redirectError = '') {
  if (!user) {
    return {
      loading: false,
      user: null,
      authorized: false,
      error: redirectError,
    };
  }

  logAuth('User email', user.email);
  const authorized = isAuthorizedAdminEmail(user.email);

  if (authorized) {
    logAuth('Login successful');
  }

  return {
    loading: false,
    user,
    authorized,
    error: authorized ? '' : 'Unauthorized Access',
  };
}

export function mapUserToAuthState(user, redirectError = '') {
  return buildAuthState(user, redirectError);
}

export function getAdminReturnPath() {
  return sessionStorage.getItem(ADMIN_RETURN_KEY) || ADMIN_DASHBOARD_PATH;
}

export function clearAdminReturnPath() {
  sessionStorage.removeItem(ADMIN_RETURN_KEY);
}

export function redirectAuthorizedAdmin(navigate, currentPath = window.location.pathname) {
  logAuth('Current route', currentPath);

  const targetPath = getAdminReturnPath().startsWith('/admin')
    ? getAdminReturnPath()
    : ADMIN_DASHBOARD_PATH;

  if (!currentPath.startsWith('/admin')) {
    logAuth('Redirect triggered', targetPath);
    navigate(targetPath, { replace: true });
    clearAdminReturnPath();
    return true;
  }

  logAuth('Already on admin route', currentPath);
  clearAdminReturnPath();
  return false;
}

export function waitForAuthRedirect() {
  if (!auth) {
    return Promise.resolve(null);
  }

  if (!redirectResultPromise) {
    redirectResultPromise = ensureAuthPersistence()
      .then(() => getRedirectResult(auth))
      .then(async (result) => {
        if (result?.user) {
          logAuth('Redirect sign-in completed');
          logAuth('User email', result.user.email);

          if (!isAuthorizedAdminEmail(result.user.email)) {
            await handleUnauthorizedUser(result.user.email);
            return null;
          }

          logAuth('Login successful');
        }

        return result;
      })
      .catch((error) => {
        logError('AdminAuthRedirect', error);
        throw error;
      });
  }

  return redirectResultPromise;
}

export function subscribeToAdminAuth(onChange) {
  if (!auth) {
    onChange({
      loading: false,
      user: null,
      authorized: false,
      error: 'Authentication is not available. Check Firebase configuration.',
    });
    return () => {};
  }

  onChange({ loading: true, user: null, authorized: false, error: '' });

  let unsubscribe = () => {};
  let cancelled = false;

  (async () => {
    await ensureAuthPersistence();

    let redirectError = '';

    try {
      await waitForAuthRedirect();
    } catch (error) {
      redirectError = getFriendlyErrorMessage(
        error,
        'Unable to complete sign in. Please try again.'
      );
    }

    if (cancelled) return;

    unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (cancelled) return;

      if (user && !isAuthorizedAdminEmail(user.email)) {
        await handleUnauthorizedUser(user.email);
        onChange(buildAuthState(null, 'Unauthorized Access'));
        return;
      }

      onChange(buildAuthState(user, redirectError));
    });
  })();

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function loginWithGoogle() {
  if (!auth) {
    return {
      success: false,
      error: getFirebaseConfigError() || 'Authentication is not available. Check Firebase configuration.',
    };
  }

  await ensureAuthPersistence();
  sessionStorage.setItem(ADMIN_RETURN_KEY, ADMIN_DASHBOARD_PATH);

  const tryRedirectSignIn = async () => {
    await signInWithRedirect(auth, provider);
    return { success: true, redirecting: true, method: 'redirect' };
  };

  // Redirect is more reliable on production custom domains (popups often blocked).
  if (!import.meta.env.DEV) {
    try {
      return await tryRedirectSignIn();
    } catch (redirectError) {
      logError('AdminAuthRedirectPrimary', redirectError);

      if (redirectError?.code === 'auth/unauthorized-domain') {
        return {
          success: false,
          error: `This domain (${window.location.hostname}) is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.`,
        };
      }
    }
  }

  try {
    logAuth('Starting popup sign-in');
    const result = await signInWithPopup(auth, provider);
    const email = result.user?.email;

    logAuth('Popup sign-in completed');
    logAuth('User email', email);

    if (!isAuthorizedAdminEmail(email)) {
      await handleUnauthorizedUser(email);
      return {
        success: false,
        error: 'Unauthorized Access',
        unauthorized: true,
      };
    }

    logAuth('Login successful');

    return {
      success: true,
      user: result.user,
      authorized: true,
      method: 'popup',
    };
  } catch (error) {
    const popupErrors = ['auth/popup-blocked', 'auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

    if (popupErrors.includes(error?.code)) {
      logAuth('Popup unavailable, falling back to redirect sign-in', error.code);

      try {
        await signInWithRedirect(auth, provider);
        return { success: true, redirecting: true, method: 'redirect' };
      } catch (redirectError) {
        logError('AdminAuthRedirectFallback', redirectError);
        return {
          success: false,
          error: getFriendlyErrorMessage(
            redirectError,
            'Unable to sign in. Please try again.'
          ),
        };
      }
    }

    logError('AdminAuthPopup', error);
    return {
      success: false,
      error: getFriendlyErrorMessage(error, 'Unable to sign in. Please try again.'),
    };
  }
}

export async function logoutAdmin() {
  if (!auth) return;
  clearAdminReturnPath();
  await signOut(auth);
  logAuth('Logged out');
}

export function getCurrentAdminUser() {
  return auth?.currentUser ?? null;
}

export function verifyAdminRouteExists() {
  if (import.meta.env.DEV) {
    logAuth('Verified /admin route is registered in App.jsx');
  }
}
