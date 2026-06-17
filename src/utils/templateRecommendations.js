import { getBundleById } from '../data/upgrades';
import { friendlyUpgradeCopy } from '../data/templateCatalog';

const RECOMMENDATION_RULES = [
  {
    bundleId: 'business-pro-bundle',
    label: 'Business Pro Bundle',
    reason: 'You selected payments, admin tools, and visitor reports — this bundle saves you money.',
    requiredFeatures: ['payment', 'admin-dashboard', 'analytics'],
    websiteTypes: ['business', 'school', 'portfolio'],
  },
  {
    bundleId: 'growth-bundle',
    label: 'Growth Bundle',
    reason: 'Great for staying visible with blog, events, and performance tracking.',
    requiredFeatures: ['blog', 'analytics'],
    websiteTypes: ['business', 'school', 'foundation', 'church', 'portfolio', 'political'],
    optionalFeatures: ['events', 'ai-assistant'],
  },
  {
    bundleId: 'foundation-pro-bundle',
    label: 'Foundation Pro Bundle',
    reason: 'Ideal for organizations that need donations, content, and admin control.',
    requiredFeatures: ['donations'],
    websiteTypes: ['foundation', 'church', 'political'],
    optionalFeatures: ['blog', 'events', 'admin-dashboard'],
  },
];

function scoreRule(rule, selectedFeatureIds) {
  const requiredMet = rule.requiredFeatures.every((id) => selectedFeatureIds.includes(id));
  if (!requiredMet) return 0;

  let score = rule.requiredFeatures.length * 10;
  if (rule.optionalFeatures) {
    score += rule.optionalFeatures.filter((id) => selectedFeatureIds.includes(id)).length * 3;
  }
  return score;
}

export function recommendBundle({ websiteTypeId, selectedUpgradeIds = [], selectedBundleId = null }) {
  if (selectedBundleId) {
    const bundle = getBundleById(selectedBundleId);
    if (bundle) {
      return {
        bundleId: bundle.id,
        name: bundle.name,
        reason: 'You already selected this recommended bundle.',
        savings: null,
      };
    }
  }

  let best = null;

  for (const rule of RECOMMENDATION_RULES) {
    if (!rule.websiteTypes.includes(websiteTypeId)) continue;

    const score = scoreRule(rule, selectedUpgradeIds);
    if (score === 0) continue;

    if (!best || score > best.score) {
      const bundle = getBundleById(rule.bundleId);
      if (!bundle) continue;

      best = {
        score,
        bundleId: rule.bundleId,
        name: rule.label,
        reason: rule.reason,
        bundle,
      };
    }
  }

  if (!best) return null;

  return {
    bundleId: best.bundleId,
    name: best.name,
    reason: best.reason,
    bundle: best.bundle,
  };
}

export function getFriendlyUpgrade(id) {
  return friendlyUpgradeCopy[id] ?? null;
}
