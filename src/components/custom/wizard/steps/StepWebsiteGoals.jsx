import { websiteGoalOptions } from '../../../../data/customWebsiteOptions';

export default function StepWebsiteGoals({ selectedGoals, onToggle, error }) {
  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">What should your website help you achieve?</h2>
        <p className="wizard-step__subtitle">Pick everything that applies — no technical knowledge needed.</p>
      </header>

      <div className="wizard-cards">
        {websiteGoalOptions.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);

          return (
            <button
              key={goal.id}
              type="button"
              className={`wizard-card${isSelected ? ' is-selected' : ''}`}
              onClick={() => onToggle(goal.id)}
              aria-pressed={isSelected}
            >
              <span className="wizard-card__check" aria-hidden="true">
                {isSelected ? '✓' : ''}
              </span>
              <span className="wizard-card__content">
                <span className="wizard-card__title">{goal.label}</span>
                <span className="wizard-card__desc">{goal.description}</span>
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
