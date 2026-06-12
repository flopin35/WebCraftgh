import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, redirectAuthorizedAdmin } from '../../services/adminAuthService';
import { checkFirebaseAuthReachable } from '../../utils/networkCheck';
import './admin.css';

export default function AdminLogin({ error: externalError = '', onAuthSuccess }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [networkWarning, setNetworkWarning] = useState('');
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(true);

  useEffect(() => {
    let active = true;

    checkFirebaseAuthReachable().then((result) => {
      if (!active) return;
      if (!result.reachable) {
        setNetworkWarning(result.message);
      }
      setIsCheckingNetwork(false);
    });

    return () => {
      active = false;
    };
  }, []);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    setError('');

    const network = await checkFirebaseAuthReachable();
    if (!network.reachable) {
      setNetworkWarning(network.message);
      setError(network.message);
      setIsSigningIn(false);
      return;
    }

    const result = await loginWithGoogle();

    if (result.redirecting) {
      return;
    }

    if (!result.success) {
      setError(result.error);
      setIsSigningIn(false);
      return;
    }

    if (result.authorized && result.user) {
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      } else {
        redirectAuthorizedAdmin(navigate, window.location.pathname);
      }
    }

    setIsSigningIn(false);
  };

  const displayError = error || externalError;

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <p className="admin-login__label">Admin Access</p>
        <h1 className="admin-login__title">Sign in to Dashboard</h1>
        <p className="admin-login__subtitle">
          Only authorized administrators can access this area. Sign in with your approved Google
          account.
        </p>

        {isCheckingNetwork && (
          <p className="admin-login__hint">Checking connection to Firebase Auth...</p>
        )}

        {networkWarning && (
          <div className="admin-login__network-warning" role="alert">
            <strong>Connection issue detected</strong>
            <p>{networkWarning}</p>
            <ul>
              <li>Use Chrome or Edge (not an in-app browser)</li>
              <li>Disable VPN, ad blockers, and privacy extensions</li>
              <li>Try mobile hotspot if Wi‑Fi DNS is failing</li>
              <li>Run in terminal: <code>ipconfig /flushdns</code></li>
            </ul>
          </div>
        )}

        {displayError && (
          <p className="admin-login__error" role="alert">
            {displayError}
          </p>
        )}

        <button
          type="button"
          className="btn btn--primary btn--full admin-login__google"
          onClick={handleGoogleSignIn}
          disabled={isSigningIn || isCheckingNetwork}
        >
          {isSigningIn ? 'Signing in with Google...' : 'Continue with Google'}
        </button>

        <p className="admin-login__hint">
          After sign-in, authorized admins are sent directly to the dashboard.
        </p>
      </div>
    </div>
  );
}
