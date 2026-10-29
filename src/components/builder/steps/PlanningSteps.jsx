import { Link } from 'react-router-dom';
import {
  BUDGET_MAX,
  BUDGET_MIN,
  BUDGET_STEP,
  BUDGET_TIERS,
  PAGE_OPTIONS,
  TYPE_PAGE_SUGGESTIONS,
  WEBSITE_PURPOSES,
  WEBSITE_TYPES,
  getTierForAmount,
} from '../../../data/builder/builderOptions';
import { formatCedis } from '../../../utils/builderPricing';
import { ChoiceGrid, Section, Segmented, StepHeader, TextField } from '../BuilderUI';

export function StepBudget({ state, updateSection }) {
  const amount = Number(state.budget.amount) || BUDGET_MIN;
  const tier = getTierForAmount(amount);
  const setAmount = (value) => {
    const clamped = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(Number(value) / BUDGET_STEP) * BUDGET_STEP || BUDGET_MIN));
    updateSection('budget', { amount: clamped });
  };

  return (
    <section className="bld-step">
      <StepHeader
        title="What's your budget?"
        subtitle="Pick a range that feels comfortable. We'll show what fits as you build, and warn you before anything goes over."
      />

      <div className="bld-tiers" role="radiogroup" aria-label="Budget range">
        {BUDGET_TIERS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={tier?.id === item.id}
            className={`bld-tier${tier?.id === item.id ? ' is-selected' : ''}`}
            onClick={() => setAmount(item.max)}
          >
            <strong>{item.label}</strong>
            <span>{item.suitableFor}</span>
          </button>
        ))}
      </div>

      <Section title="Fine-tune your budget" hint="Drag the slider or type an amount (GH₵1,000 – GH₵10,000).">
        <div className="bld-budget-slider">
          <input
            type="range"
            min={BUDGET_MIN}
            max={BUDGET_MAX}
            step={BUDGET_STEP}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-label="Budget amount"
            aria-valuetext={formatCedis(amount)}
          />
          <div className="bld-budget-input">
            <span>GH₵</span>
            <input
              type="number"
              inputMode="numeric"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={amount}
              onChange={(event) => updateSection('budget', { amount: Number(event.target.value) })}
              onBlur={(event) => setAmount(event.target.value)}
              aria-label="Budget amount in cedis"
            />
          </div>
        </div>
        {tier && <p className="bld-note">{tier.suitableFor}</p>}
      </Section>

      <div className="bld-callout">
        <strong>Budget above GH₵10,000, or something unusual?</strong>
        <p>
          Large platforms, complex integrations or unique ideas are best handled with a{' '}
          <Link to="/custom-estimate?from=builder">custom estimate</Link>. Our team reviews it and quotes personally.
        </p>
      </div>
      <p className="bld-disclaimer">
        Your budget helps us recommend the right scope. It is not a fixed price — nothing is guaranteed at a particular price until WebCraft has
        reviewed your requirements.
      </p>
    </section>
  );
}

export function StepType({ state, update }) {
  const chooseType = (typeId) => {
    const customized = state.pages.length > 1;
    update({ type: typeId, ...(customized ? {} : { pages: TYPE_PAGE_SUGGESTIONS[typeId] ?? ['home'] }) });
  };
  const togglePurpose = (id) =>
    update({ purposes: state.purposes.includes(id) ? state.purposes.filter((p) => p !== id) : [...state.purposes, id] });

  return (
    <section className="bld-step">
      <StepHeader title="What are you building?" subtitle="Choose the closest match — we'll suggest pages to start with." />
      <Section title="Website type">
        <ChoiceGrid options={WEBSITE_TYPES} selected={state.type} onToggle={chooseType} columns={3} />
      </Section>
      {(state.type === 'web-app' || state.type === 'other') && (
        <p className="bld-note bld-note--warn">
          This type of project is always reviewed by our team before quoting. You can keep building, or{' '}
          <Link to="/custom-estimate?from=builder">request a custom estimate</Link> directly.
        </p>
      )}
      <Section title="What should the website do for you?" hint="Select all that apply.">
        <ChoiceGrid options={WEBSITE_PURPOSES} selected={state.purposes} onToggle={togglePurpose} multiple columns={3} />
      </Section>
      <TextField
        label="Describe your main goal in your own words"
        value={state.goalText}
        onChange={(goalText) => update({ goalText })}
        multiline
        maxLength={1000}
        placeholder="e.g. I want customers in Kumasi to find my salon and book appointments without calling."
      />
    </section>
  );
}

export function StepPages({ state, update, priceList }) {
  const togglePage = (id) => {
    if (id === 'home') return;
    update({ pages: state.pages.includes(id) ? state.pages.filter((p) => p !== id) : [...state.pages, id] });
  };
  const options = PAGE_OPTIONS.map((page) => ({
    ...page,
    description: page.locked
      ? 'Included in the base price'
      : `+${formatCedis(priceList.pages[page.id] ?? 0)}${page.perItem ? ' each' : ''}${page.requires?.length ? ' · adds required features' : ''}`,
  }));
  const extras = state.extraPages ?? [];
  const setExtra = (index, patch) => update({ extraPages: extras.map((page, i) => (i === index ? { ...page, ...patch } : page)) });

  return (
    <section className="bld-step">
      <StepHeader title="Choose your pages" subtitle="We've pre-selected common pages for your website type. Add or remove anything." />
      <ChoiceGrid options={options} selected={state.pages} onToggle={togglePage} multiple columns={3} />

      {state.pages.includes('service-details') && (
        <div className="bld-inline">
          <label htmlFor="svc-count">How many individual service pages?</label>
          <input
            id="svc-count"
            type="number"
            min={1}
            max={50}
            value={state.serviceCount}
            onChange={(event) => update({ serviceCount: Math.max(1, Math.min(50, Number(event.target.value) || 1)) })}
          />
        </div>
      )}

      <Section title="Need other pages?" hint="Describe any extra pages. Complex pages (calculators, portals…) are estimated after review.">
        {extras.map((page, index) => (
          <div className="bld-extra" key={index}>
            <input
              className="bld-field__input"
              placeholder="Page name, e.g. Careers"
              value={page.name}
              maxLength={80}
              onChange={(event) => setExtra(index, { name: event.target.value })}
              aria-label={`Extra page ${index + 1} name`}
            />
            <Segmented
              label="Complexity"
              options={[
                { id: 'simple', label: `Simple (+${formatCedis(priceList.extraPage.simple)})` },
                { id: 'complex', label: `Complex (+${formatCedis(priceList.extraPage.complex)}*)` },
              ]}
              value={page.complexity}
              onChange={(complexity) => setExtra(index, { complexity })}
            />
            <button type="button" className="bld-link-btn" onClick={() => update({ extraPages: extras.filter((_, i) => i !== index) })}>
              Remove
            </button>
          </div>
        ))}
        {extras.length < 15 && (
          <button type="button" className="btn btn--outline" onClick={() => update({ extraPages: [...extras, { name: '', complexity: 'simple', notes: '' }] })}>
            + Add a page
          </button>
        )}
      </Section>
    </section>
  );
}
