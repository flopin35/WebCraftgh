import {
  freeFeatures,
  getBundleById,
  getBundleSavings,
  paidUpgrades,
  premiumBundles,
} from '../../data/upgrades';
import './WebsiteUpgrades.css';

export default function WebsiteUpgrades({
  selectedUpgradeIds,
  selectedBundleId,
  onToggleUpgrade,
  onToggleBundle,
}) {
  const bundleIncludedIds = selectedBundleId
    ? getBundleById(selectedBundleId)?.includes ?? []
    : [];

  return (
    <section className="upgrades request-card" aria-labelledby="upgrades-title">
      <p className="request-card__label">Customize Your Website</p>
      <h2 id="upgrades-title" className="request-card__title">
        Website Upgrades
      </h2>
      <p className="upgrades__intro">
        Every project includes professional essentials at no extra cost. Add paid upgrades or
        bundles to enhance your website.
      </p>

      <div className="upgrades__section">
        <h3 className="upgrades__section-title">Included Free With Every Website</h3>
        <ul className="upgrades__free-list">
          {freeFeatures.map((feature) => (
            <li key={feature}>
              <span aria-hidden="true">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <p className="upgrades__free-note">These features never affect your pricing.</p>
      </div>

      <div className="upgrades__section">
        <h3 className="upgrades__section-title">Paid Upgrades</h3>
        <div className="upgrades__list">
          {paidUpgrades.map((upgrade) => {
            const isIncludedInBundle = bundleIncludedIds.includes(upgrade.id);
            const isChecked = selectedUpgradeIds.includes(upgrade.id) || isIncludedInBundle;

            return (
              <label
                key={upgrade.id}
                className={`upgrades__item${isChecked ? ' is-checked' : ''}${isIncludedInBundle ? ' is-in-bundle' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isIncludedInBundle}
                  onChange={() => onToggleUpgrade(upgrade.id)}
                />
                <span className="upgrades__item-content">
                  <span className="upgrades__item-header">
                    <span className="upgrades__item-name">{upgrade.name}</span>
                    <span className="upgrades__item-price">
                      GHS {upgrade.price.toLocaleString()}
                    </span>
                  </span>
                  <span className="upgrades__item-description">{upgrade.description}</span>
                  {upgrade.includes && (
                    <ul className="upgrades__item-includes">
                      {upgrade.includes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {isIncludedInBundle && (
                    <span className="upgrades__item-badge">Included in bundle</span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="upgrades__section">
        <h3 className="upgrades__section-title">Premium Bundles</h3>
        <div className="upgrades__bundles">
          {premiumBundles.map((bundle) => {
            const isSelected = selectedBundleId === bundle.id;
            const savings = getBundleSavings(bundle);

            return (
              <label
                key={bundle.id}
                className={`upgrades__bundle${isSelected ? ' is-selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleBundle(bundle.id)}
                />
                <span className="upgrades__bundle-content">
                  <span className="upgrades__bundle-top">
                    <span className="upgrades__bundle-name">{bundle.name}</span>
                    <span className="upgrades__bundle-badge">{bundle.badge}</span>
                  </span>
                  <span className="upgrades__bundle-price">
                    GHS {bundle.price.toLocaleString()}
                  </span>
                  {savings > 0 && bundle.badge.startsWith('Save') === false && (
                    <span className="upgrades__bundle-savings">
                      Save GHS {savings.toLocaleString()}
                    </span>
                  )}
                  <ul className="upgrades__bundle-includes">
                    {bundle.includes.map((upgradeId) => {
                      const upgrade = paidUpgrades.find((item) => item.id === upgradeId);
                      return upgrade ? <li key={upgradeId}>{upgrade.name}</li> : null;
                    })}
                  </ul>
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}
