import './request.css';

function formatPrice(amount) {
  return `GHS ${Number(amount || 0).toLocaleString()}`;
}

export default function RequestPricing({ pricing, includeDeployment }) {
  return (
    <aside
      className={`request-card request-pricing${includeDeployment ? ' request-pricing--active' : ''}`}
      aria-labelledby="request-pricing-title"
    >
      <p className="request-card__label">Live Estimate</p>
      <h2 id="request-pricing-title" className="request-card__title">
        Pricing Summary
      </h2>

      <dl className="request-pricing__rows">
        <div className="request-pricing__row">
          <dt>Base Template Price</dt>
          <dd>{formatPrice(pricing.templatePrice)}</dd>
        </div>

        {pricing.bundleName && (
          <div className="request-pricing__row request-pricing__row--bundle">
            <dt>{pricing.bundleName}</dt>
            <dd>{formatPrice(pricing.bundlePrice)}</dd>
          </div>
        )}

        <div className="request-pricing__row">
          <dt>Selected Upgrades</dt>
          <dd>{formatPrice(pricing.upgradesSubtotal)}</dd>
        </div>

        {pricing.bundleDiscount > 0 && (
          <div className="request-pricing__row request-pricing__row--savings">
            <dt>Bundle Discount</dt>
            <dd>Save {formatPrice(pricing.bundleDiscount)}</dd>
          </div>
        )}

        <div className={`request-pricing__row${includeDeployment ? ' request-pricing__row--highlight' : ''}`}>
          <dt>Deployment Cost</dt>
          <dd>{formatPrice(pricing.deploymentFee)}</dd>
        </div>
      </dl>

      <div className="request-pricing__divider" />

      <div className="request-pricing__total">
        <span className="request-pricing__total-label">Final Total</span>
        <span className="request-pricing__total-value">{formatPrice(pricing.total)}</span>
      </div>

      <p className="request-pricing__note">
        Prices update instantly as you select upgrades and bundles. Free included features never
        affect your total.
      </p>
    </aside>
  );
}
