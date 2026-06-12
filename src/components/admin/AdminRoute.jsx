import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import {
  mapUserToAuthState,
  redirectAuthorizedAdmin,
  subscribeToAdminAuth,
  verifyAdminRouteExists,
  waitForAuthRedirect,
} from '../../services/adminAuthService';
import './admin.css';

export default function AdminRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    authorized: false,
    error: '',
  });

  useEffect(() => {
    verifyAdminRouteExists();
    return subscribeToAdminAuth(setAuthState);
  }, []);

  useEffect(() => {
    if (authState.loading || !authState.user || !authState.authorized) {
      return;
    }

    redirectAuthorizedAdmin(navigate, location.pathname);
  }, [authState.loading, authState.user, authState.authorized, location.pathname, navigate]);

  if (authState.loading) {
    return (
      <div className="admin-route-loading">
        <p>Completing sign in...</p>
      </div>
    );
  }

  if (authState.user && !authState.authorized) {
    return (
      <Navigate
        to="/"
        replace
        state={{ unauthorized: true, from: location.pathname }}
      />
    );
  }

  if (!authState.user) {
    return (
      <AdminLogin
        error={authState.error}
        onAuthSuccess={(user) => {
          setAuthState(mapUserToAuthState(user));
          redirectAuthorizedAdmin(navigate, location.pathname);
        }}
      />
    );
  }

  return <Outlet />;
}

export function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    waitForAuthRedirect()
      .then((result) => {
        if (!result?.user) {
          return;
        }

        redirectAuthorizedAdmin(navigate, location.pathname);
      })
      .catch(() => {
        // Errors are surfaced on the admin login screen.
      });
  }, [navigate, location.pathname]);

  return null;
}
