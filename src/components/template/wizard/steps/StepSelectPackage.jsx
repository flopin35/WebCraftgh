import { getPackagesForWebsiteType, labelForWebsiteType } from '../../../../data/templateCatalog';

export default function StepSelectPackage({ websiteTypeId, packageId, onSelect, error }) {
  const packages = getPackagesForWebsiteType(websiteTypeId);

  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">Choose your package</h2>
        <p className="wizard-step__subtitle">
          Packages for {labelForWebsiteType(websiteTypeId)}. Pick the level that matches your needs.
        </p>
      </header>

      <div className="wizard-cards">
        {packages.map((pkg) => {
          const isSelected = packageId === pkg.id;

          return (
            <button
              key={pkg.id}
              type="button"
              className={`wizard-card wizard-card--package${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSelect(pkg.id)}
              aria-pressed={isSelected}
            >
              <span className="wizard-card__check" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
              <span className="wizard-card__content">
                {pkg.tag && <span className="package-card__tag">{pkg.tag}</span>}
                <span className="wizard-card__title">{pkg.name}</span>
                <span className="package-card__price">GHS {pkg.price.toLocaleString()}</span>
                <span className="wizard-card__desc">{pkg.description}</span>
                <ul className="package-card__features">
                  {pkg.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="wizard-step__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
