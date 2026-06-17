export default function StepContact({ formData, onChange, error }) {
  const handleChange = (event) => {
    onChange({ [event.target.name]: event.target.value });
  };

  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">Your contact details</h2>
        <p className="wizard-step__subtitle">
          We&apos;ll use this to confirm your request and reach you within 24–48 hours.
        </p>
      </header>

      <div className="wizard-fields wizard-fields--two">
        <div className="wizard-field">
          <label className="wizard-field__label" htmlFor="fullName">
            Full Name <span className="wizard-field__required">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="wizard-field__input"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
            placeholder="Your full name"
          />
        </div>
        <div className="wizard-field">
          <label className="wizard-field__label" htmlFor="phone">
            Phone Number <span className="wizard-field__required">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="wizard-field__input"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            placeholder="e.g. 050 123 4567"
          />
        </div>
        <div className="wizard-field">
          <label className="wizard-field__label" htmlFor="email">
            Email <span className="wizard-field__required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="wizard-field__input"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="you@business.com"
          />
        </div>
        <div className="wizard-field">
          <label className="wizard-field__label" htmlFor="businessName">
            Business Name <span className="wizard-field__required">*</span>
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            className="wizard-field__input"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="Your business or organization"
          />
        </div>
        <div className="wizard-field wizard-field--full">
          <label className="wizard-field__label" htmlFor="additionalNotes">
            Additional Notes <span className="wizard-field__optional">(optional)</span>
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            className="wizard-field__textarea"
            value={formData.additionalNotes}
            onChange={handleChange}
            placeholder="Anything else we should know about your project?"
          />
        </div>
      </div>

      {error && (
        <p className="wizard-step__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
