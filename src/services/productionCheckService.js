import { ADMIN_EMAIL } from '../constants/admin';
import { app, auth, db, isFirebaseConfigured } from '../firebase';
import { isAuthorizedAdminEmail } from '../services/adminAuthService';
import { testFirestoreConnection } from '../services/adminRequestService';
import { generateReceiptId, isValidReceiptId } from '../utils/generateReceipt';
import { resolveSecureRequestData } from '../utils/securePricing';

async function checkFirebaseConnected() {
  const success = isFirebaseConfigured() && Boolean(app);
  return {
    id: 'firebase',
    label: 'Firebase Connected',
    success,
    message: success ? 'Firebase app initialized.' : 'Firebase configuration is missing or invalid.',
  };
}

async function checkFirestoreConnected() {
  const result = await testFirestoreConnection();
  return {
    id: 'firestore',
    label: 'Firestore Connected',
    success: result.success,
    message: result.message,
  };
}

function checkRequestSubmission() {
  const sample = resolveSecureRequestData({
    template: { id: 'business' },
    formData: {
      fullName: 'Test User',
      phone: '0500000000',
      businessName: 'Test Business',
    },
    selectedUpgradeIds: ['blog'],
    selectedBundleId: null,
    includeDeployment: false,
  });

  const success = sample.success && sample.pricing.total > 0;

  return {
    id: 'submission',
    label: 'Request Submission Working',
    success,
    message: success
      ? 'Validation and secure pricing pipeline are ready.'
      : 'Request validation or pricing pipeline failed.',
  };
}

function checkReceiptGeneration() {
  try {
    const receiptId = generateReceiptId();
    const success = isValidReceiptId(receiptId);

    return {
      id: 'receipt',
      label: 'Receipt Generation Working',
      success,
      message: success ? `Sample receipt format verified (${receiptId}).` : 'Receipt format is invalid.',
    };
  } catch {
    return {
      id: 'receipt',
      label: 'Receipt Generation Working',
      success: false,
      message: 'Unable to generate receipt IDs.',
    };
  }
}

function checkDashboardReady() {
  const success = Boolean(db && auth);
  return {
    id: 'dashboard',
    label: 'Dashboard Working',
    success,
    message: success ? 'Admin dashboard services are available.' : 'Dashboard dependencies are unavailable.',
  };
}

function checkAdminProtection() {
  const authorized = isAuthorizedAdminEmail(ADMIN_EMAIL);
  const currentUser = auth?.currentUser;
  const currentAuthorized = currentUser ? isAuthorizedAdminEmail(currentUser.email) : false;

  return {
    id: 'admin',
    label: 'Admin Protection Working',
    success: authorized,
    message: authorized
      ? currentAuthorized
        ? `Signed in as authorized admin (${ADMIN_EMAIL}).`
        : `Admin email locked to ${ADMIN_EMAIL}. Sign in required for dashboard access.`
      : 'Admin email configuration is invalid.',
  };
}

export async function runProductionChecks() {
  const checks = await Promise.all([
    checkFirebaseConnected(),
    checkFirestoreConnected(),
    Promise.resolve(checkRequestSubmission()),
    Promise.resolve(checkReceiptGeneration()),
    Promise.resolve(checkDashboardReady()),
    Promise.resolve(checkAdminProtection()),
  ]);

  const passed = checks.filter((check) => check.success).length;

  return {
    checks,
    passed,
    total: checks.length,
    ready: passed === checks.length,
  };
}

export function logProductionCheckReport(report) {
  console.group('[WebCraft Production Check]');
  report.checks.forEach((check) => {
    const icon = check.success ? '✓' : '✗';
    console.log(`${icon} ${check.label}: ${check.message}`);
  });
  console.log(`Result: ${report.passed}/${report.total} checks passed`);
  console.groupEnd();
}
