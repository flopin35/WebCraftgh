import { budgetOptions, timelineOptions } from '../../../../data/customWebsiteOptions';

function OptionCards({ label, options, value, onChange, required = false }) {
  return (
    <fieldset className="wizard-budget-group">
      <legend className="wizard-budget-group__label">
        {label}
        {required && <span className="wizard-field__required"> *</span>}
      </legend>
      <div className="wizard-budget-cards">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`wizard-budget-card${value === option.id ? ' is-selected' : ''}`}
            onClick={() => onChange(option.id)}
            aria-pressed={value === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function StepBudgetTimeline({ budget, timeline, onBudgetChange, onTimelineChange, error }) {
  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">Budget & timeline</h2>
        <p className="wizard-step__subtitle">
          This helps us recommend the right package — no commitment yet.
        </p>
      </header>

      <OptionCards
        label="What is your budget range?"
        options={budgetOptions}
        value={budget}
        onChange={onBudgetChange}
        required
      />
      <OptionCards
        label="When do you need the website?"
        options={timelineOptions}
        value={timeline}
        onChange={onTimelineChange}
        required
      />

      {error && (
        <p className="wizard-step__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
