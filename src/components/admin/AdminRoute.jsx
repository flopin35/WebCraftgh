import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import {
  mapUserToAuthState,
  subscribeToAdminAuth,
  verifyAdminRouteExists,
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
          if (!location.pathname.startsWith('/admin')) {
            navigate('/admin', { replace: true });
          }
        }}
      />
    );
  }

  return <Outlet />;
}

export { AuthRedirectHandler } from './AuthRedirectHandler';
