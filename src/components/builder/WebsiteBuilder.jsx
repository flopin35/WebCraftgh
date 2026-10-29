import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BUILDER_STEPS } from '../../data/builder/builderOptions';
import { DEFAULT_PRICE_LIST } from '../../data/builder/defaultPriceList';
import { useBuilderDraft } from '../../hooks/useBuilderDraft';
import { submitBuilderRequest } from '../../services/builderService';
import { loadPriceList } from '../../services/priceListService';
import { applySuggestion, calculateEstimate, isEcommerceRelevant } from '../../utils/builderPricing';
import { validateBuilderStep } from '../../utils/builderValidation';
import { ErrorList } from './BuilderUI';
import EstimatePanel from './EstimatePanel';
import LivePreview from './LivePreview';
import { StepBranding, StepStyle, StepText } from './steps/DesignSteps';
import { StepDetails, StepSummary } from './steps/FinalSteps';
import { StepBudget, StepPages, StepType } from './steps/PlanningSteps';
import { StepContent, StepDomain, StepEcommerce, StepFeatures } from './steps/ScopeSteps';
import './builder.css';

const STEP_COMPONENTS = {
  budget: StepBudget,
  type: StepType,
  pages: StepPages,
  branding: StepBranding,
  style: StepStyle,
  text: StepText,
  features: StepFeatures,
  ecommerce: StepEcommerce,
  content: StepContent,
  domain: StepDomain,
  summary: StepSummary,
  details: StepDetails,
};

export default function WebsiteBuilder() {
  const navigate = useNavigate();
  const draft = useBuilderDraft();
  const { state, update, uploads, setUploads, savedAt } = draft;
  const [priceList, setPriceList] = useState(DEFAULT_PRICE_LIST);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadPriceList().then(({ priceList: list }) => alive && setPriceList(list));
    return () => {
      alive = false;
    };
  }, []);

  const pricing = useMemo(() => calculateEstimate(state, priceList), [state, priceList]);
  const steps = useMemo(() => BUILDER_STEPS.filter((step) => step.id !== 'ecommerce' || isEcommerceRelevant(state)), [state]);
  let index = steps.findIndex((step) => step.id === state.stepId);
  if (index < 0) index = 0;
  const step = steps[index];
  const furthest = Math.max(index, steps.findIndex((s) => s.id === state.furthestStep));
  const StepComponent = STEP_COMPONENTS[step.id];

  useEffect(() => {
    const heading = bodyRef.current?.querySelector('[data-step-heading]');
    heading?.focus({ preventScroll: true });
  }, [step.id]);

  const goTo = (stepId) => {
    setErrors([]);
    const targetIndex = steps.findIndex((s) => s.id === stepId);
    update({ stepId, furthestStep: steps[Math.max(furthest, targetIndex)]?.id ?? stepId });
    bodyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const extraChecks = () => {
    if (step.id === 'summary' && pricing.budget.overBudget && !state.overBudgetAcknowledged) {
      return ['Your selections are over budget. Apply a suggestion, remove features, or tick the box to acknowledge before continuing.'];
    }
    return [];
  };

  const handleNext = async () => {
    const result = validateBuilderStep(step.id, state);
    const allErrors = [...result.errors, ...extraChecks()];
    if (allErrors.length) {
      setErrors(allErrors);
      return;
    }
    setErrors([]);
    if (index < steps.length - 1) {
      goTo(steps[index + 1].id);
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    const response = await submitBuilderRequest({ state, uploads, priceList });
    setSubmitting(false);
    if (!response.success) {
      setSubmitError(response.error);
      return;
    }
    draft.reset();
    navigate('/build/submitted', { state: { request: response.request } });
  };

  const handleUploadChange = (category, files) => setUploads((current) => ({ ...current, [category]: files }));

  return (
    <div className="bld">
      <nav className="bld-progress" aria-label="Builder progress">
        <div className="bld-progress__meta">
          <span>
            Step {index + 1} of {steps.length}: <strong>{step.label}</strong>
          </span>
          <span className="bld-progress__saved">{savedAt ? 'Progress saved on this device' : ''}</span>
        </div>
        <div className="bld-progress__bar">
          <span style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
        </div>
        <ol className="bld-progress__steps">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                className={`${i === index ? 'is-current' : ''}${i < index || i <= furthest ? ' is-done' : ''}`}
                disabled={i > furthest}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => goTo(s.id)}
              >
                <span>{i + 1}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="bld-layout">
        <div className="bld-main" ref={bodyRef}>
          <StepComponent
            state={state}
            update={update}
            updateSection={draft.updateSection}
            toggleIn={draft.toggleIn}
            pricing={pricing}
            priceList={priceList}
            uploads={uploads}
            onUploadChange={handleUploadChange}
            goTo={goTo}
          />
          <ErrorList errors={errors} />
          {submitError && (
            <div className="bld-errors" role="alert">
              <p>{submitError}</p>
              <p>Your answers are still saved. You can try again now.</p>
            </div>
          )}
          <div className="bld-nav">
            {index > 0 ? (
              <button type="button" className="btn btn--outline" onClick={() => goTo(steps[index - 1].id)} disabled={submitting}>
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button type="button" className="btn btn--primary btn--lg" onClick={handleNext} disabled={submitting}>
              {step.id === 'details' ? (submitting ? 'Submitting…' : submitError ? 'Retry submission' : 'Submit project brief') : 'Continue →'}
            </button>
          </div>
        </div>

        <aside className={`bld-side${showPreview ? ' is-open' : ''}`} aria-label="Live preview and estimate">
          <EstimatePanel pricing={pricing} budget={state.budget.amount} onApplySuggestion={(s) => update((current) => applySuggestion(current, s))} />
          <LivePreview state={state} features={pricing.features} logoFile={uploads.logo[0]} />
        </aside>
      </div>

      <div className="bld-mobilebar">
        <EstimatePanel pricing={pricing} budget={state.budget.amount} compact />
        <button type="button" className="btn btn--outline" onClick={() => setShowPreview((v) => !v)} aria-expanded={showPreview}>
          {showPreview ? 'Hide preview' : 'Preview'}
        </button>
      </div>
    </div>
  );
}
