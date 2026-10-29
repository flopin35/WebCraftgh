import { Link } from 'react-router-dom';
import {
  COLOR_MODES,
  CONTACT_METHODS,
  CONTENT_RESPONSIBILITY,
  FEATURE_OPTIONS,
  FONT_PAIRINGS,
  HOSTING_OPTIONS,
  LANGUAGE_OPTIONS,
  MAINTENANCE_OPTIONS,
  PAGE_OPTIONS,
  PAYMENT_METHODS,
  PRODUCT_COUNT_OPTIONS,
  TIMELINE_OPTIONS,
  VISUAL_STYLES,
  WEBSITE_PURPOSES,
  WEBSITE_TYPES,
  getTierForAmount,
  labelOf,
} from '../../../data/builder/builderOptions';
import { findMissingContent } from '../../../utils/builderBrief';
import { formatCedis, isEcommerceRelevant } from '../../../utils/builderPricing';
import { Checkbox, ChoiceGrid, Section, StepHeader, TextField } from '../BuilderUI';

function Row({ label, children, onEdit }) {
  return (
    <div className="bld-sum__row">
      <dt>{label}</dt>
      <dd>{children || '—'}</dd>
      {onEdit && (
        <button type="button" className="bld-link-btn" onClick={onEdit} aria-label={`Edit ${label}`}>
          Edit
        </button>
      )}
    </div>
  );
}

export function EstimateBreakdown({ pricing }) {
  const groups = [...new Set(pricing.lineItems.map((item) => item.category))];
  return (
    <div className="bld-breakdown">
      {groups.map((group) => (
        <div key={group} className="bld-breakdown__group">
          <h4>{group}</h4>
          {pricing.lineItems
            .filter((item) => item.category === group)
            .map((item) => (
              <div key={item.id} className="bld-breakdown__line">
                <span>{item.label}</span>
                <span>{formatCedis(item.amount)}</span>
              </div>
            ))}
        </div>
      ))}
      {pricing.appliedBundles.map((bundle) => (
        <div key={bundle.id} className="bld-breakdown__line bld-breakdown__line--saving">
          <span>{bundle.label} saving</span>
          <span>−{formatCedis(bundle.discount)}</span>
        </div>
      ))}
      <div className="bld-breakdown__total">
        <span>Estimated development cost</span>
        <strong>{formatCedis(pricing.estimate)}</strong>
      </div>
      <p className="bld-breakdown__range">
        Likely range {formatCedis(pricing.range.low)} – {formatCedis(pricing.range.high)} · estimate only, final quote after review
      </p>
    </div>
  );
}

export function StepSummary({ state, update, pricing, goTo }) {
  const missing = findMissingContent(state);
  const tier = getTierForAmount(state.budget.amount);
  const list = (ids, options) => ids.map((id) => labelOf(options, id)).join(', ');

  return (
    <section className="bld-step">
      <StepHeader title="Review your project" subtitle="Check everything below. Click Edit to change any section — your other choices are kept." />

      <dl className="bld-sum">
        <Row label="Budget" onEdit={() => goTo('budget')}>
          {formatCedis(state.budget.amount)} {tier && `(${tier.label})`}
        </Row>
        <Row label="Website type" onEdit={() => goTo('type')}>
          {labelOf(WEBSITE_TYPES, state.type)}
        </Row>
        <Row label="Main purpose" onEdit={() => goTo('type')}>
          {[list(state.purposes, WEBSITE_PURPOSES), state.goalText].filter(Boolean).join(' — ')}
        </Row>
        <Row label="Pages" onEdit={() => goTo('pages')}>
          {[
            ...state.pages.map((id) => `${labelOf(PAGE_OPTIONS, id)}${id === 'service-details' ? ` ×${state.serviceCount}` : ''}`),
            ...state.extraPages.filter((p) => p.name.trim()).map((p) => `${p.name} (extra)`),
          ].join(', ')}
        </Row>
        <Row label="Colours & branding" onEdit={() => goTo('branding')}>
          <span className="bld-swatches bld-swatches--inline">
            {[state.branding.primary, state.branding.secondary, state.branding.accent].map((c) => (
              <i key={c} style={{ background: c }} title={c} />
            ))}
          </span>{' '}
          {state.branding.primary} / {state.branding.secondary} / {state.branding.accent}
          {state.branding.wantsLogoDesign && ' · logo design requested'}
        </Row>
        <Row label="Style & fonts" onEdit={() => goTo('style')}>
          {labelOf(VISUAL_STYLES, state.style.styleId)} · {labelOf(COLOR_MODES, state.style.colorMode)} · {labelOf(FONT_PAIRINGS, state.style.fontId)}
        </Row>
        <Row label="Text" onEdit={() => goTo('text')}>
          <strong>{state.text.projectName}</strong>
          {state.text.headline && ` — "${state.text.headline}"`}
          <br />
          Languages: {list(state.text.languages, LANGUAGE_OPTIONS)}
          {state.text.copywritingHelp && ' · copywriting help'}
        </Row>
        <Row label="Features" onEdit={() => goTo('features')}>
          {list(pricing.features, FEATURE_OPTIONS)}
        </Row>
        {isEcommerceRelevant(state) && (
          <Row label="Store" onEdit={() => goTo('ecommerce')}>
            {labelOf(PRODUCT_COUNT_OPTIONS, state.ecommerce.productCount)} · payments: {list(state.ecommerce.paymentMethods, PAYMENT_METHODS)}
          </Row>
        )}
        <Row label="Content" onEdit={() => goTo('content')}>
          {labelOf(CONTENT_RESPONSIBILITY, state.content.responsibility)}
        </Row>
        <Row label="Domain & hosting" onEdit={() => goTo('domain')}>
          {state.domain.ownsDomain === 'yes' ? `Own domain: ${state.domain.domainName}` : state.domain.wantsDomainHelp ? 'Needs help choosing a domain' : 'No domain yet'} ·{' '}
          {labelOf(HOSTING_OPTIONS, state.domain.hosting)} · {labelOf(MAINTENANCE_OPTIONS, state.domain.maintenance)}
        </Row>
      </dl>

      <Section title="Current estimate">
        <EstimateBreakdown pricing={pricing} />
      </Section>

      <Section title="Recurring & third-party costs (not included above)">
        <ul className="bld-list">
          {pricing.recurring.map((item) => (
            <li key={item.id}>
              {item.label}: {item.amount ? `about ${formatCedis(item.amount)} per ${item.period}` : item.note}
            </li>
          ))}
          {pricing.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </Section>

      {pricing.manualReview.length > 0 && (
        <div className="bld-callout bld-callout--warn">
          <strong>Needs a manual review before we can quote</strong>
          <ul>
            {pricing.manualReview.map((item) => (
              <li key={item.id}>
                {item.label} — {item.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {missing.length > 0 && (
        <div className="bld-callout bld-callout--info">
          <strong>Content still needed</strong>
          <p>No problem — you can send these later. Just be aware the launch depends on them.</p>
          <ul>
            {missing.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <Section title="Assumptions & exclusions">
        <ul className="bld-list">
          {[...pricing.assumptions, ...pricing.excluded].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      {pricing.exceedsBuilderCap && (
        <div className="bld-callout bld-callout--warn">
          <strong>This project is larger than our standard builder covers (GH₵10,000).</strong>
          <p>
            You can still submit it and we'll review it as a custom project, or <Link to="/custom-estimate?from=builder">request a custom estimate</Link> instead.
          </p>
        </div>
      )}

      {pricing.budget.overBudget && (
        <Checkbox
          label={`I understand this configuration is about ${formatCedis(pricing.budget.overBy)} over my budget`}
          description="We'll still review it and suggest ways to fit your budget."
          checked={state.overBudgetAcknowledged}
          onChange={(overBudgetAcknowledged) => update({ overBudgetAcknowledged })}
        />
      )}
      <Checkbox
        label="I confirm this summary is accurate"
        description="You can still make changes after talking to our team."
        checked={state.summaryConfirmed}
        onChange={(summaryConfirmed) => update({ summaryConfirmed })}
      />
    </section>
  );
}

export function StepDetails({ state, updateSection }) {
  const c = state.customer;
  const set = (key) => (value) => updateSection('customer', { [key]: value });
  return (
    <section className="bld-step">
      <StepHeader title="Your details" subtitle="Where should we send your quotation?" />
      <div className="bld-two">
        <TextField label="Your name" value={c.fullName} onChange={set('fullName')} maxLength={120} required autoComplete="name" />
        <TextField label="Business or organization" value={c.businessName} onChange={set('businessName')} maxLength={120} autoComplete="organization" />
        <TextField label="Email address" type="email" value={c.email} onChange={set('email')} maxLength={120} required autoComplete="email" />
        <TextField
          label="Phone / WhatsApp number"
          type="tel"
          value={c.phone}
          onChange={set('phone')}
          maxLength={30}
          required={c.contactMethod !== 'email'}
          autoComplete="tel"
          placeholder="+233 …"
        />
      </div>
      <Section title="How should we contact you?">
        <ChoiceGrid options={CONTACT_METHODS} selected={c.contactMethod} onToggle={set('contactMethod')} columns={3} />
      </Section>
      <Section title="When would you like the website ready?">
        <ChoiceGrid options={TIMELINE_OPTIONS} selected={c.timeline} onToggle={set('timeline')} columns={3} />
      </Section>
      <div className="bld-privacy">
        <strong>Privacy notice</strong>
        <p>
          We use the information in this brief — your contact details, project choices and any files you upload — only to assess your project, prepare a
          quotation and contact you about it. It is stored securely and only accessible to the WebCraft team. We don't sell or share it with third parties.
          You can ask us to correct or delete your information at any time by contacting us with your reference number.
        </p>
      </div>
      <Checkbox
        label="I agree to WebCraft using my details as described above"
        checked={c.consent}
        onChange={set('consent')}
      />
    </section>
  );
}
