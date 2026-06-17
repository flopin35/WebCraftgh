/**
 * Canonical lead summary shape stored on both template and custom website requests.
 *
 * Required fields:
 * - name, businessName, businessType, websiteGoal, budget, timeline
 * - selectedFeatures (array of feature ids)
 * - estimatedValue (number), leadScore (1–100)
 */

export function normalizeLeadSummary(summary) {
  if (!summary || typeof summary !== 'object') return null;

  return {
    name: String(summary.name ?? '').trim(),
    businessName: String(summary.businessName ?? '').trim(),
    businessType: String(summary.businessType ?? '').trim(),
    businessTypeLabel: String(summary.businessTypeLabel ?? summary.businessType ?? '').trim(),
    websiteGoal: String(summary.websiteGoal ?? '').trim(),
    budget: String(summary.budget ?? '').trim(),
    timeline: String(summary.timeline ?? '').trim(),
    selectedFeatures: Array.isArray(summary.selectedFeatures) ? summary.selectedFeatures : [],
    featureLabels: Array.isArray(summary.featureLabels) ? summary.featureLabels : [],
    estimatedValue: Number(summary.estimatedValue) || 0,
    estimatedValueLabel: String(summary.estimatedValueLabel ?? '').trim(),
    leadScore: Math.min(100, Math.max(1, Number(summary.leadScore) || 1)),
    leadScoreLabel: String(summary.leadScoreLabel ?? '').trim(),
    requestType: summary.requestType === 'custom' ? 'custom' : 'template',
  };
}

export function isCompleteLeadSummary(summary) {
  const normalized = normalizeLeadSummary(summary);
  if (!normalized) return false;

  return (
    normalized.name.length > 0 &&
    normalized.businessName.length > 0 &&
    normalized.businessType.length > 0 &&
    normalized.websiteGoal.length > 0 &&
    normalized.budget.length > 0 &&
    normalized.timeline.length > 0 &&
    normalized.leadScore >= 1 &&
    normalized.leadScore <= 100 &&
    normalized.estimatedValue >= 0
  );
}
