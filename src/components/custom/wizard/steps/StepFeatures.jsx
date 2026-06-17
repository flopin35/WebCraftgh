import { featureOptions } from '../../../../data/customWebsiteOptions';

export default function StepFeatures({ selectedFeatures, onToggle }) {
  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">Which features would help your business?</h2>
        <p className="wizard-step__subtitle">
          Optional — select only what you need. We’ll recommend the rest after reviewing your request.
        </p>
      </header>

      <div className="wizard-cards">
        {featureOptions.map((feature) => {
          const isSelected = selectedFeatures.includes(feature.id);

          return (
            <button
              key={feature.id}
              type="button"
              className={`wizard-card wizard-card--feature${isSelected ? ' is-selected' : ''}`}
              onClick={() => onToggle(feature.id)}
              aria-pressed={isSelected}
            >
              <span className="wizard-card__check" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
              <span className="wizard-card__content">
                <span className="wizard-card__title">{feature.label}</span>
                <span className="wizard-card__desc">{feature.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
