import {
  budgetOptions,
  businessTypes,
  featureOptions,
  timelineOptions,
  websiteGoalOptions,
} from '../../../../data/customWebsiteOptions';
import { buildLeadSummary, calculateEstimatedPriceRange } from '../../../../utils/customLeadScoring';

function labelFor(options, id) {
  return options.find((item) => item.id === id)?.label ?? id;
}

function ReviewRow({ label, value }) {
  if (!value) return null;

  return (
    <div className="wizard-review__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function StepReview({ state }) {
  const { formData, websiteGoals, selectedFeatures, projectDetails, budget, timeline } = state;
  const estimatedPriceRange = calculateEstimatedPriceRange(budget);

  const leadSummary = buildLeadSummary({
    customer: formData,
    websiteGoals,
    selectedFeatures,
    projectDetails,
    budget,
    timeline,
    estimatedPriceRange,
  });

  return (
    <section className="wizard-step">
      <header className="wizard-step__header">
        <h2 className="wizard-step__title">Review your request</h2>
        <p className="wizard-step__subtitle">Check everything looks right, then submit for your free quote.</p>
      </header>

      <div className="wizard-review">
        <div className="wizard-review__highlight">
          <p className="wizard-review__estimate-label">Estimated project range</p>
          <p className="wizard-review__estimate">{leadSummary.budget}</p>
          <p className="wizard-review__estimate-note">Final price confirmed after we review your needs.</p>
        </div>

        <dl className="wizard-review__list">
          <ReviewRow label="Name" value={formData.fullName} />
          <ReviewRow label="Phone" value={formData.phone} />
          <ReviewRow label="Email" value={formData.email} />
          <ReviewRow label="Business" value={formData.businessName} />
          <ReviewRow label="Type" value={labelFor(businessTypes, formData.businessType)} />
          <ReviewRow
            label="Website goals"
            value={websiteGoals.map((id) => labelFor(websiteGoalOptions, id)).join(', ')}
          />
          <ReviewRow
            label="Features"
            value={
              selectedFeatures.length
                ? selectedFeatures.map((id) => labelFor(featureOptions, id)).join(', ')
                : 'None selected — we’ll advise you'
            }
          />
          <ReviewRow label="Budget" value={labelFor(budgetOptions, budget)} />
          <ReviewRow label="Timeline" value={labelFor(timelineOptions, timeline)} />
        </dl>

        {projectDetails.description && (
          <div className="wizard-review__notes">
            <p className="wizard-review__notes-label">Project notes</p>
            <p>{projectDetails.description}</p>
          </div>
        )}
      </div>
    </section>
  );
}
