import { websiteTypes } from '../../../../data/templateCatalog';

export default function StepWebsiteType({ websiteTypeId, onSelect, error }) {
  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">What type of website do you need?</h2>
        <p className="wizard-step__subtitle">
          Choose the option that best fits your organization. We&apos;ll show only relevant packages next.
        </p>
      </header>

      <div className="wizard-cards">
        {websiteTypes.map((type) => {
          const isSelected = websiteTypeId === type.id;

          return (
            <button
              key={type.id}
              type="button"
              className={`wizard-card${isSelected ? ' is-selected' : ''}`}
              onClick={() => onSelect(type.id)}
              aria-pressed={isSelected}
            >
              <span className="wizard-card__check" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
              <span className="wizard-card__content">
                <span className="wizard-card__title">{type.label}</span>
                <span className="wizard-card__desc">{type.description}</span>
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
