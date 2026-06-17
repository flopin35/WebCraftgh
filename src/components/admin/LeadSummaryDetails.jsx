import { formatPrice } from '../../utils/formatters';
import './admin.css';

export default function LeadSummaryDetails({ leadSummary }) {
  if (!leadSummary) {
    return (
      <section className="admin-details__section">
        <h3>Lead Summary</h3>
        <p className="admin-details__muted">No lead summary available for this request.</p>
      </section>
    );
  }

  return (
    <section className="admin-details__section admin-lead-summary">
      <h3>Lead Summary</h3>
      <div className="admin-lead-summary__score">
        <span className="admin-lead-summary__score-value">{leadSummary.leadScore}</span>
        <div>
          <p className="admin-lead-summary__score-label">
            {leadSummary.leadScoreLabel || 'Lead Score'}
          </p>
          <p className="admin-details__muted">
            Est. value:{' '}
            {leadSummary.estimatedValueLabel || formatPrice(leadSummary.estimatedValue)}
          </p>
        </div>
      </div>
      <dl className="admin-details__list">
        <div>
          <dt>Name</dt>
          <dd>{leadSummary.name || '—'}</dd>
        </div>
        <div>
          <dt>Business Name</dt>
          <dd>{leadSummary.businessName || '—'}</dd>
        </div>
        <div>
          <dt>Business Type</dt>
          <dd>{leadSummary.businessTypeLabel || leadSummary.businessType || '—'}</dd>
        </div>
        <div>
          <dt>Website Goal</dt>
          <dd>{leadSummary.websiteGoal || '—'}</dd>
        </div>
        <div>
          <dt>Budget</dt>
          <dd>{leadSummary.budget || '—'}</dd>
        </div>
        <div>
          <dt>Timeline</dt>
          <dd>{leadSummary.timeline || '—'}</dd>
        </div>
        <div>
          <dt>Estimated Value</dt>
          <dd>{leadSummary.estimatedValueLabel || formatPrice(leadSummary.estimatedValue)}</dd>
        </div>
      </dl>
      {leadSummary.featureLabels?.length > 0 ? (
        <>
          <p className="admin-details__label">Selected Features</p>
          <ul className="admin-details__features">
            {leadSummary.featureLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="admin-details__muted">No extra features selected.</p>
      )}
    </section>
  );
}
