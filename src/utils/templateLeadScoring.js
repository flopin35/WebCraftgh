import { labelForWebsiteType } from '../data/templateCatalog';
import { getBundleById, getUpgradeById } from '../data/upgrades';
import { normalizeLeadSummary } from './leadSummary';

const TYPE_SCORES = {
  business: 8,
  school: 6,
  foundation: 7,
  church: 7,
  portfolio: 4,
  political: 9,
};

export function calculateTemplateLeadScore({
  websiteTypeId,
  packagePrice = 0,
  selectedUpgradeIds = [],
  selectedBundleId = null,
  pricing = {},
}) {
  let score = TYPE_SCORES[websiteTypeId] || 5;

  const total = pricing.total || packagePrice;
  if (total >= 5000) score += 30;
  else if (total >= 3000) score += 22;
  else if (total >= 2000) score += 15;
  else if (total >= 1500) score += 10;
  else score += 6;

  score += Math.min(selectedUpgradeIds.length * 3, 15);
  if (selectedBundleId) score += 8;
  if (selectedUpgradeIds.includes('payment')) score += 10;

  return Math.min(100, Math.max(1, score));
}

export function getTemplateLeadScoreLabel(score) {
  if (score >= 75) return 'Hot Lead';
  if (score >= 50) return 'Warm Lead';
  if (score >= 30) return 'Qualified Lead';
  return 'Early Stage';
}

export function buildTemplateLeadSummary({
  customer,
  websiteTypeId,
  template,
  selectedUpgradeIds,
  selectedBundleId,
  pricing,
}) {
  const bundle = selectedBundleId ? getBundleById(selectedBundleId) : null;
  const bundleFeatureIds = bundle?.includes ?? [];
  const allFeatureIds = [...new Set([...bundleFeatureIds, ...selectedUpgradeIds])];

  const featureLabels = allFeatureIds
    .map((id) => getUpgradeById(id)?.name)
    .filter(Boolean);

  const estimatedValue = pricing?.total || template?.price || 0;
  const leadScore = calculateTemplateLeadScore({
    websiteTypeId,
    packagePrice: template?.price,
    selectedUpgradeIds: allFeatureIds,
    selectedBundleId,
    pricing,
  });

  const budgetLabel =
    estimatedValue >= 5000
      ? 'GHS 5,000+'
      : estimatedValue >= 3000
        ? 'GHS 3,000 – GHS 5,000'
        : estimatedValue >= 2000
          ? 'GHS 2,000 – GHS 3,000'
          : estimatedValue >= 1500
            ? 'GHS 1,500 – GHS 2,000'
            : 'Under GHS 1,500';

  return normalizeLeadSummary({
    name: customer.fullName,
    businessName: customer.businessName,
    businessType: websiteTypeId,
    businessTypeLabel: labelForWebsiteType(websiteTypeId),
    websiteGoal: template?.name || labelForWebsiteType(websiteTypeId),
    budget: budgetLabel,
    timeline: 'Flexible — template package',
    selectedFeatures: allFeatureIds,
    featureLabels,
    estimatedValue,
    estimatedValueLabel: `GHS ${estimatedValue.toLocaleString()}`,
    leadScore,
    leadScoreLabel: getTemplateLeadScoreLabel(leadScore),
    requestType: 'template',
  });
}
