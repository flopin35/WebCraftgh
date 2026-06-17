import { getBundleById } from '../../../../data/upgrades';
import { labelForWebsiteType } from '../../../../data/templateCatalog';
import { buildSelectedUpgradesList } from '../../../../utils/pricing';

function formatPrice(amount) {
  return `GHS ${Number(amount || 0).toLocaleString()}`;
}

export default function StepReview({
  websiteTypeId,
  template,
  selectedUpgradeIds,
  selectedBundleId,
  pricing,
  formData,
}) {
  const selectedUpgrades = buildSelectedUpgradesList(selectedUpgradeIds, selectedBundleId);
  const bundle = selectedBundleId ? getBundleById(selectedBundleId) : null;

  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">Review your request</h2>
        <p className="wizard-step__subtitle">
          Confirm everything looks correct before submitting. No payment required now.
        </p>
      </header>

      <div className="review-summary">
        <div className="review-summary__block">
          <h3>Website Type</h3>
          <p>{labelForWebsiteType(websiteTypeId)}</p>
        </div>

        <div className="review-summary__block">
          <h3>Selected Package</h3>
          <p>{template?.name}</p>
          <p>{formatPrice(template?.price)}</p>
        </div>

        {bundle && (
          <div className="review-summary__block">
            <h3>Recommended Bundle</h3>
            <p>{bundle.name}</p>
            <p>{formatPrice(bundle.price)}</p>
          </div>
        )}

        <div className="review-summary__block">
          <h3>Selected Features</h3>
          {selectedUpgrades.length ? (
            <ul className="review-summary__list">
              {selectedUpgrades.map((upgrade) => (
                <li key={upgrade.id}>
                  {upgrade.name} — {formatPrice(upgrade.price)}
                </li>
              ))}
            </ul>
          ) : (
            <p>No extra features selected.</p>
          )}
        </div>

        <div className="review-summary__block">
          <h3>Contact</h3>
          <ul className="review-summary__list">
            <li>{formData.fullName}</li>
            <li>{formData.phone}</li>
            <li>{formData.email}</li>
            <li>{formData.businessName}</li>
          </ul>
          {formData.additionalNotes && <p>{formData.additionalNotes}</p>}
        </div>

        <div className="review-summary__block">
          <h3>Estimated Cost</h3>
          <p className="review-summary__total">{formatPrice(pricing.total)}</p>
        </div>
      </div>
    </section>
  );
}
