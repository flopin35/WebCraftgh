const LOCK_KEY = 'webcraft_submission_lock';
const LOCK_DURATION_MS = 60_000;

function buildFingerprint({ templateId, formData, selectedUpgradeIds, selectedBundleId, includeDeployment }) {
  return JSON.stringify({
    templateId,
    fullName: formData.fullName?.trim(),
    phone: formData.phone?.trim(),
    businessName: formData.businessName?.trim(),
    selectedUpgradeIds: [...(selectedUpgradeIds || [])].sort(),
    selectedBundleId: selectedBundleId || null,
    includeDeployment: Boolean(includeDeployment),
  });
}

export function isDuplicateSubmission(fingerprint) {
  try {
    const raw = sessionStorage.getItem(LOCK_KEY);
    if (!raw) return false;

    const lock = JSON.parse(raw);
    const isExpired = Date.now() - lock.timestamp > LOCK_DURATION_MS;

    if (isExpired) {
      sessionStorage.removeItem(LOCK_KEY);
      return false;
    }

    return lock.fingerprint === fingerprint;
  } catch {
    return false;
  }
}

export function markSubmissionStarted(fingerprint) {
  sessionStorage.setItem(
    LOCK_KEY,
    JSON.stringify({
      fingerprint,
      timestamp: Date.now(),
    })
  );
}

export function clearSubmissionLock() {
  sessionStorage.removeItem(LOCK_KEY);
}

export function buildSubmissionFingerprint(requestInput) {
  return buildFingerprint({
    templateId: requestInput.template?.id,
    formData: requestInput.formData,
    selectedUpgradeIds: requestInput.selectedUpgradeIds,
    selectedBundleId: requestInput.selectedBundleId,
    includeDeployment: requestInput.includeDeployment,
  });
}
