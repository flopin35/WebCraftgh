import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCedis } from '../../utils/builderPricing';
import { EstimateBreakdown } from './steps/FinalSteps';

export default function EstimatePanel({ pricing, budget, onApplySuggestion, compact = false }) {
  const [showDetails, setShowDetails] = useState(false);
  const { overBudget, overBy, remaining } = pricing.budget;
  const used = Math.min(100, Math.round((pricing.estimate / Math.max(1, budget)) * 100));

  return (
    <div className={`bld-est${overBudget ? ' is-over' : ''}${compact ? ' bld-est--compact' : ''}`} aria-live="polite">
      <div className="bld-est__top">
        <div>
          <span className="bld-est__label">Estimated cost</span>
          <strong className="bld-est__amount">{formatCedis(pricing.estimate)}</strong>
        </div>
        <div className="bld-est__budget">
          <span className="bld-est__label">Your budget</span>
          <strong>{formatCedis(budget)}</strong>
        </div>
      </div>
      <div className="bld-est__bar" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={100} aria-label="Budget used">
        <span style={{ width: `${used}%` }} />
      </div>
      <p className="bld-est__remaining">
        {overBudget ? <>⚠ {formatCedis(overBy)} over budget</> : <>{formatCedis(remaining)} remaining</>}
        {pricing.needsManualReview && <span className="bld-est__flag"> · some items need review</span>}
      </p>

      {!compact && (
        <>
          {overBudget && pricing.suggestions.length > 0 && (
            <div className="bld-est__suggest">
              <strong>Ways to fit your budget</strong>
              {pricing.suggestions.slice(0, 3).map((s) => (
                <div key={s.featureId} className="bld-est__alt">
                  <p>
                    <b>{s.replaceLabel ? `Swap ${s.label} → ${s.replaceLabel}` : `Remove ${s.label}`}</b> — save ~{formatCedis(s.saving)}
                    <br />
                    <small>{s.note}</small>
                    {s.lockedBy && <small> (also removes pages that need it)</small>}
                  </p>
                  <button type="button" className="btn btn--outline" onClick={() => onApplySuggestion(s)}>
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
          {pricing.exceedsBuilderCap && (
            <p className="bld-est__cap">
              Above GH₵10,000 — consider a <Link to="/custom-estimate?from=builder">custom estimate</Link>.
            </p>
          )}
          <button type="button" className="bld-link-btn" onClick={() => setShowDetails((v) => !v)} aria-expanded={showDetails}>
            {showDetails ? 'Hide breakdown' : 'See what’s included'}
          </button>
          {showDetails && <EstimateBreakdown pricing={pricing} />}
          <p className="bld-est__fine">Estimate only. Recurring costs (domain, hosting) are separate. Final price confirmed by WebCraft after review.</p>
        </>
      )}
    </div>
  );
}
