import { WIZARD_STEPS } from '../../../data/customWebsiteOptions';
import './CustomWizard.css';

export default function WizardProgress({ currentStep }) {
  const progress = Math.round((currentStep / WIZARD_STEPS.length) * 100);

  return (
    <div className="wizard-progress">
      <div className="wizard-progress__header">
        <p className="wizard-progress__label">
          Step {currentStep} of {WIZARD_STEPS.length}
        </p>
        <p className="wizard-progress__percent">{progress}% complete</p>
      </div>
      <div className="wizard-progress__track" aria-hidden="true">
        <span className="wizard-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <ol className="wizard-progress__steps">
        {WIZARD_STEPS.map((step) => (
          <li
            key={step.id}
            className={`wizard-progress__step${
              step.id === currentStep ? ' is-active' : ''
            }${step.id < currentStep ? ' is-complete' : ''}`}
          >
            <span className="wizard-progress__dot">{step.id < currentStep ? '✓' : step.id}</span>
            <span className="wizard-progress__name">{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
