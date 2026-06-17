export default function WizardNavigation({
  onBack,
  onNext,
  nextLabel = 'Continue',
  backLabel = 'Back',
  showBack = true,
  isNextDisabled = false,
  isSubmitting = false,
}) {
  return (
    <div className="wizard-nav">
      {showBack ? (
        <button type="button" className="btn btn--outline wizard-nav__back" onClick={onBack} disabled={isSubmitting}>
          {backLabel}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        className="btn btn--primary wizard-nav__next"
        onClick={onNext}
        disabled={isNextDisabled || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : nextLabel}
      </button>
    </div>
  );
}
