import { getBundleById, getBundleSavings } from '../../../../data/upgrades';
import { recommendBundle } from '../../../../utils/templateRecommendations';

export default function StepRecommendation({
  websiteTypeId,
  selectedUpgradeIds,
  selectedBundleId,
  onApplyBundle,
  onSkip,
}) {
  const effectiveIds = [...new Set(selectedUpgradeIds)];
  const existingBundle = selectedBundleId ? getBundleById(selectedBundleId) : null;

  if (existingBundle) {
    effectiveIds.push(...existingBundle.includes);
  }

  const recommendation = recommendBundle({
    websiteTypeId,
    selectedUpgradeIds: effectiveIds,
    selectedBundleId,
  });

  if (!recommendation || (selectedBundleId && selectedBundleId === recommendation.bundleId)) {
    return (
      <section className="wizard-step">
        <header className="wizard-step__header">
          <h2 className="wizard-step__title">You&apos;re all set</h2>
          <p className="wizard-step__subtitle">
            {selectedBundleId
              ? 'Your bundle is already applied. Continue to enter your contact details.'
              : 'No bundle recommendation right now — that\'s fine. Continue when ready.'}
          </p>
        </header>
      </section>
    );
  }

  const bundle = recommendation.bundle;
  const savings = getBundleSavings(bundle);

  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">Recommended for you</h2>
        <p className="wizard-step__subtitle">
          Based on your selections, this package saves you money and includes everything you need.
        </p>
      </header>

      <div className="recommendation-card">
        <span className="recommendation-card__badge">Recommended For You</span>
        <h3 className="recommendation-card__title">{recommendation.name}</h3>
        <p className="recommendation-card__reason">{recommendation.reason}</p>
        <p className="recommendation-card__price">
          GHS {bundle.price.toLocaleString()}
          {savings > 0 && (
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
              {' '}
              (Save GHS {savings.toLocaleString()})
            </span>
          )}
        </p>
        <div className="recommendation-card__actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onApplyBundle(recommendation.bundleId)}
          >
            Apply Recommendation
          </button>
          <button type="button" className="btn btn--outline" onClick={onSkip}>
            Continue Without Bundle
          </button>
        </div>
      </div>
    </section>
  );
}
