import {
  BUDGET_IDS,
  budgetOptions,
  businessTypes,
  featureOptions,
  labelForOption,
  timelineOptions,
  websiteGoalOptions,
} from '../data/customWebsiteOptions';

const BUDGET_SCORES = {
  'under-1000': 8,
  '1000-3000': 18,
  '3000-5000': 28,
  '5000-plus': 35,
};

const TIMELINE_SCORES = {
  asap: 25,
  '1-month': 18,
  '3-months': 12,
  flexible: 6,
};

const BUSINESS_TYPE_SCORES = {
  business: 5,
  school: 4,
  'foundation-ngo': 4,
  church: 4,
  'political-campaign': 6,
  'personal-portfolio': 2,
  other: 3,
};

const FEATURE_VALUE_GHS = {
  payment: 900,
  booking: 450,
  donations: 350,
  'user-accounts': 500,
  blog: 150,
  'multi-language': 400,
  'admin-dashboard': 600,
  'ai-assistant': 250,
  analytics: 200,
};

const BUDGET_MIDPOINT_GHS = {
  'under-1000': 900,
  '1000-3000': 2000,
  '3000-5000': 4000,
  '5000-plus': 6500,
};

export function calculateEstimatedPriceRange(budget) {
  const labels = {
    'under-1000': 'GHS 800 – GHS 1,000',
    '1000-3000': 'GHS 1,000 – GHS 3,000',
    '3000-5000': 'GHS 3,000 – GHS 5,000',
    '5000-plus': 'GHS 5,000+',
  };

  return labels[budget] || 'GHS 2,000+';
}

export function calculateEstimatedValueGhs(budget, selectedFeatures = []) {
  const base = BUDGET_MIDPOINT_GHS[budget] || 2000;
  const featurePremium = selectedFeatures.reduce(
    (sum, id) => sum + (FEATURE_VALUE_GHS[id] || 0) * 0.15,
    0
  );

  return Math.round(base + featurePremium);
}

export function calculateLeadScore({
  customer,
  websiteGoals = [],
  selectedFeatures = [],
  projectDetails = {},
  budget,
  timeline,
}) {
  let score = 0;

  score += BUDGET_SCORES[budget] || 0;
  score += TIMELINE_SCORES[timeline] || 0;
  score += Math.min(selectedFeatures.length * 4, 20);
  score += Math.min(websiteGoals.length * 3, 15);
  score += BUSINESS_TYPE_SCORES[customer?.businessType] || 0;

  if (projectDetails.hasLogo === 'yes') score += 3;
  if (projectDetails.hasContent === 'yes') score += 5;
  if (projectDetails.hasContent === 'partial') score += 3;
  if (projectDetails.hasDomain === 'yes') score += 4;
  if ((projectDetails.description || '').trim().length > 50) score += 5;

  return Math.min(100, Math.max(1, score));
}

export function getLeadScoreLabel(score) {
  if (score >= 75) return 'Hot Lead';
  if (score >= 50) return 'Warm Lead';
  if (score >= 30) return 'Qualified Lead';
  return 'Early Stage';
}

export function buildLeadSummary({
  customer,
  websiteGoals,
  selectedFeatures,
  projectDetails,
  budget,
  timeline,
  estimatedPriceRange,
}) {
  const priceRange = estimatedPriceRange || calculateEstimatedPriceRange(budget);
  const estimatedValue = calculateEstimatedValueGhs(budget, selectedFeatures);
  const leadScore = calculateLeadScore({
    customer,
    websiteGoals,
    selectedFeatures,
    projectDetails,
    budget,
    timeline,
  });

  return {
    name: customer.fullName,
    businessName: customer.businessName,
    businessType: customer.businessType,
    businessTypeLabel: labelForOption(businessTypes, customer.businessType),
    websiteGoals,
    websiteGoalLabels: websiteGoals.map((id) => labelForOption(websiteGoalOptions, id)),
    budget,
    budgetLabel: labelForOption(budgetOptions, budget),
    timeline,
    timelineLabel: labelForOption(timelineOptions, timeline),
    selectedFeatures,
    featureLabels: selectedFeatures.map((id) => labelForOption(featureOptions, id)),
    estimatedPriceRange: priceRange,
    estimatedValue,
    estimatedValueLabel: `GHS ${estimatedValue.toLocaleString()}`,
    leadScore,
    leadScoreLabel: getLeadScoreLabel(leadScore),
  };
}

export function isValidBudgetId(id) {
  return BUDGET_IDS.includes(id);
}
