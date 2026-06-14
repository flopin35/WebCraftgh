import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import {
  clearAdminReturnPath,
  getAdminReturnPath,
  isAuthorizedAdminEmail,
  waitForAuthRedirect,
} from '../../services/adminAuthService';

export function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth) return undefined;

    let cancelled = false;

    const redirectAuthorizedUser = (user) => {
      if (cancelled || !user || !isAuthorizedAdminEmail(user.email)) {
        return;
      }

      if (location.pathname.startsWith('/admin')) {
        clearAdminReturnPath();
        return;
      }

      const returnPath = getAdminReturnPath();
      const target = returnPath.startsWith('/admin') ? returnPath : '/admin';
      navigate(target, { replace: true });
      clearAdminReturnPath();
    };

    (async () => {
      try {
        const result = await waitForAuthRedirect();
        redirectAuthorizedUser(result?.user ?? auth.currentUser);
      } catch {
        // Errors are surfaced on the admin login screen.
      }
    })();

    const unsubscribe = onAuthStateChanged(auth, redirectAuthorizedUser);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [navigate, location.pathname]);

  return null;
}
