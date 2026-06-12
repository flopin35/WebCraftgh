import { getBundleById, getUpgradeById } from '../data/upgrades';
import { getTemplateById } from '../services/templateService';
import { calculatePricing } from './pricing';

export function sanitizeUpgradeSelection(selectedUpgradeIds = [], selectedBundleId = null) {
  const validBundleId = selectedBundleId && getBundleById(selectedBundleId) ? selectedBundleId : null;
  const bundle = validBundleId ? getBundleById(validBundleId) : null;
  const bundleIncluded = bundle?.includes ?? [];

  const validUpgradeIds = [...new Set(selectedUpgradeIds)]
    .filter((id) => getUpgradeById(id))
    .filter((id) => !bundleIncluded.includes(id));

  return {
    selectedUpgradeIds: validUpgradeIds,
    selectedBundleId: validBundleId,
  };
}

export function resolveSecureRequestData(requestInput) {
  const template = getTemplateById(requestInput.template?.id);

  if (!template) {
    return {
      success: false,
      error: 'Invalid template selected. Please choose a template and try again.',
    };
  }

  const { selectedUpgradeIds, selectedBundleId } = sanitizeUpgradeSelection(
    requestInput.selectedUpgradeIds,
    requestInput.selectedBundleId
  );

  const includeDeployment = Boolean(requestInput.includeDeployment);
  const pricing = calculatePricing({
    templatePrice: template.price,
    selectedUpgradeIds,
    selectedBundleId,
    includeDeployment,
  });

  return {
    success: true,
    template,
    selectedUpgradeIds,
    selectedBundleId,
    includeDeployment,
    pricing,
  };
}
