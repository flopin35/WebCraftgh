import CustomUploadSection from '../../CustomUploadSection';
import { contentReadinessOptions, readinessOptions } from '../../../../data/customWebsiteOptions';

function ReadinessGroup({ label, name, value, options, onChange }) {
  return (
    <fieldset className="wizard-readiness">
      <legend className="wizard-readiness__label">{label}</legend>
      <div className="wizard-readiness__options">
        {options.map((option) => (
          <label key={option.id} className="wizard-readiness__option">
            <input
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={(event) => onChange(event.target.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function StepProjectDetails({
  projectDetails,
  onChange,
  uploads,
  onUploadChange,
  onUploadRemove,
  error,
}) {
  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">A few quick questions about your project</h2>
        <p className="wizard-step__subtitle">Simple yes/no answers — this helps us quote faster.</p>
      </header>

      <div className="wizard-readiness-list">
        <ReadinessGroup
          label="Do you already have a logo?"
          name="hasLogo"
          value={projectDetails.hasLogo}
          options={readinessOptions}
          onChange={(value) => onChange({ hasLogo: value })}
        />
        <ReadinessGroup
          label="Do you already have content (text, photos, services)?"
          name="hasContent"
          value={projectDetails.hasContent}
          options={contentReadinessOptions}
          onChange={(value) => onChange({ hasContent: value })}
        />
        <ReadinessGroup
          label="Do you own a domain name (e.g. yourbusiness.com)?"
          name="hasDomain"
          value={projectDetails.hasDomain}
          options={readinessOptions}
          onChange={(value) => onChange({ hasDomain: value })}
        />
        <ReadinessGroup
          label="Do you have examples of websites you like?"
          name="hasExamples"
          value={projectDetails.hasExamples}
          options={readinessOptions}
          onChange={(value) => onChange({ hasExamples: value })}
        />
      </div>

      {projectDetails.hasExamples === 'yes' && (
        <div className="wizard-field wizard-field--full">
          <label className="wizard-field__label" htmlFor="exampleNotes">
            Share website links or describe what you like
          </label>
          <textarea
            id="exampleNotes"
            className="wizard-field__textarea"
            value={projectDetails.exampleNotes}
            onChange={(event) => onChange({ exampleNotes: event.target.value })}
            placeholder="Paste links or describe styles you prefer..."
            rows={3}
          />
        </div>
      )}

      <div className="wizard-field wizard-field--full">
        <label className="wizard-field__label" htmlFor="description">
          Describe your business and any special requirements{' '}
          <span className="wizard-field__required">*</span>
        </label>
        <textarea
          id="description"
          className="wizard-field__textarea"
          value={projectDetails.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="Example: We run a tutoring center and want parents to book sessions and pay online."
          rows={5}
        />
      </div>

      <CustomUploadSection
        uploads={uploads}
        onUploadChange={onUploadChange}
        onRemoveFile={onUploadRemove}
      />

      {error && (
        <p className="wizard-step__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
