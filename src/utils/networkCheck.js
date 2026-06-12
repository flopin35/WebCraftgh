const AUTH_PROBE_URL = 'https://identitytoolkit.googleapis.com/$discovery/rest?version=v1';
const PROBE_TIMEOUT_MS = 8000;

export async function checkFirebaseAuthReachable() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

    await fetch(AUTH_PROBE_URL, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return { reachable: true };
  } catch (error) {
    const isAbort = error?.name === 'AbortError';
    const isNetwork =
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('NetworkError') ||
      error?.name === 'TypeError';

    return {
      reachable: false,
      message: isAbort
        ? 'Connection to Firebase Auth timed out. Check your internet and try again.'
        : isNetwork
          ? 'Cannot reach Firebase Auth servers (identitytoolkit.googleapis.com). This is usually a DNS, firewall, VPN, or browser extension issue — not a WebCraft code issue.'
          : 'Unable to verify Firebase Auth connectivity.',
    };
  }
}
