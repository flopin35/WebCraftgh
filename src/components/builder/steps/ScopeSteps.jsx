import {
  BUILDER_UPLOADS,
  CONTENT_RESPONSIBILITY,
  CONTENT_STATUS,
  ECOMMERCE_SELL_TYPES,
  FEATURE_OPTIONS,
  HOSTING_OPTIONS,
  MAINTENANCE_OPTIONS,
  PAYMENT_METHODS,
  PRODUCT_COUNT_OPTIONS,
  YES_NO_UNSURE,
} from '../../../data/builder/builderOptions';
import { formatCedis } from '../../../utils/builderPricing';
import { Checkbox, ChoiceGrid, FileDrop, Question, Section, StepHeader, TextField } from '../BuilderUI';

export function StepFeatures({ state, toggleIn, priceList, pricing }) {
  const groups = [...new Set(FEATURE_OPTIONS.map((feature) => feature.group))];
  const autoIds = new Set(pricing.autoAdded.map((item) => item.id));
  const priceHint = (feature) => {
    if (feature.locked) return 'Always included';
    if (priceList.manualReviewFeatures.includes(feature.id)) return 'Priced after review';
    const amount = priceList.features[feature.id] ?? 0;
    return amount ? `+${formatCedis(amount)}` : 'Included';
  };

  return (
    <section className="bld-step">
      <StepHeader title="Features" subtitle="Pick what your website needs. Prices update live on the right." />
      {pricing.autoAdded.length > 0 && (
        <div className="bld-callout bld-callout--info">
          <strong>Added automatically because of your other choices</strong>
          <ul>
            {pricing.autoAdded.map((item) => (
              <li key={item.id}>
                {item.label} — {item.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
      {groups.map((group) => (
        <Section key={group} title={group}>
          <ChoiceGrid
            options={FEATURE_OPTIONS.filter((feature) => feature.group === group).map((feature) => ({
              ...feature,
              locked: feature.locked || autoIds.has(feature.id),
              description: autoIds.has(feature.id) ? 'Required by another choice' : priceHint(feature),
            }))}
            selected={pricing.features}
            onToggle={(id) => toggleIn('features', id)}
            multiple
            columns={3}
          />
        </Section>
      ))}
      {state.features.includes('custom-functionality') && (
        <p className="bld-note bld-note--warn">Describe your custom functionality in the Content step notes — our team will price it after review.</p>
      )}
    </section>
  );
}

export function StepEcommerce({ state, updateSection, toggleIn, priceList }) {
  const ec = state.ecommerce;
  const ep = priceList.ecommerce;
  const set = (key) => (value) => updateSection('ecommerce', { [key]: value });
  return (
    <section className="bld-step">
      <StepHeader title="Online store setup" subtitle="A few questions so the cart, checkout, payments and orders are estimated properly." />
      <Section title="What will you sell?">
        <ChoiceGrid options={ECOMMERCE_SELL_TYPES} selected={ec.sellTypes} onToggle={(id) => toggleIn('sellTypes', id, 'ecommerce')} multiple columns={3} />
      </Section>
      <Section title="Roughly how many products?">
        <ChoiceGrid
          options={PRODUCT_COUNT_OPTIONS.map((opt) => ({
            ...opt,
            description: ep.productCountManualReview.includes(opt.id) ? 'Needs review' : ep.productCount[opt.id] ? `+${formatCedis(ep.productCount[opt.id])}` : 'Included',
          }))}
          selected={ec.productCount}
          onToggle={set('productCount')}
          columns={4}
        />
      </Section>
      <Section title="Store options">
        <Question label={`Product variations like size or colour? (+${formatCedis(ep.variations)})`} options={YES_NO_UNSURE} value={ec.variations} onChange={set('variations')} />
        <Question label="Track stock / inventory?" options={YES_NO_UNSURE} value={ec.inventory} onChange={set('inventory')} />
        <Question label={`Discount codes? (+${formatCedis(ep.discountCodes)})`} options={YES_NO_UNSURE} value={ec.discountCodes} onChange={set('discountCodes')} />
        <Question label={`Delivery fees or shipping rules? (+${formatCedis(ep.deliveryRules)})`} options={YES_NO_UNSURE} value={ec.deliveryRules} onChange={set('deliveryRules')} />
        <Question label={`Order tracking for customers? (+${formatCedis(ep.orderTracking)})`} options={YES_NO_UNSURE} value={ec.orderTracking} onChange={set('orderTracking')} />
        <Question label={`Order confirmation emails/messages? (+${formatCedis(ep.orderConfirmations)})`} options={YES_NO_UNSURE} value={ec.orderConfirmations} onChange={set('orderConfirmations')} />
      </Section>
      <Section title="Payment methods" hint="Mobile Money is the most popular choice in Ghana. Gateways like Paystack and Hubtel support MoMo and cards together.">
        <ChoiceGrid
          options={PAYMENT_METHODS.map((m) => ({
            ...m,
            description: ep.paymentMethodManualReview.includes(m.id) ? 'Needs review' : ep.paymentMethod[m.id] ? `+${formatCedis(ep.paymentMethod[m.id])}` : 'No extra setup cost',
          }))}
          selected={ec.paymentMethods}
          onToggle={(id) => toggleIn('paymentMethods', id, 'ecommerce')}
          multiple
          columns={2}
        />
        <p className="bld-note">Payment providers charge their own transaction fees (typically 1.5–3%). These are not part of our estimate.</p>
      </Section>
      <TextField
        label="Any advanced integrations? (accounting software, POS, ERP, couriers…)"
        value={ec.advancedNotes}
        onChange={set('advancedNotes')}
        multiline
        maxLength={1000}
        hint="These are flagged for manual review. "
      />
    </section>
  );
}

export function StepContent({ state, updateSection, uploads, onUploadChange, priceList }) {
  const c = state.content;
  const set = (key) => (value) => updateSection('content', { [key]: value });
  return (
    <section className="bld-step">
      <StepHeader title="Content & assets" subtitle="Let's check what you already have, so nothing is missing at launch." />
      <Section title="What do you already have?">
        <Question label="Website text" options={CONTENT_STATUS} value={c.hasText} onChange={set('hasText')} />
        <Question label="A logo" options={CONTENT_STATUS} value={c.hasLogo} onChange={set('hasLogo')} />
        <Question label="Product photos" options={CONTENT_STATUS} value={c.hasProductPhotos} onChange={set('hasProductPhotos')} />
        <Question label="Professional business photos" options={CONTENT_STATUS} value={c.hasBusinessPhotos} onChange={set('hasBusinessPhotos')} />
      </Section>
      <Checkbox
        label={`Help me source suitable images & icons (+${formatCedis(priceList.content.assetSourcingFlat)})`}
        description="Licensed stock images chosen to match your brand. Paid premium photography is quoted separately."
        checked={c.wantsAssetSourcing}
        onChange={set('wantsAssetSourcing')}
      />
      <Section title="Reference materials" hint="Menus, brochures, price lists, brand guidelines, sketches… (PDF or images)">
        <FileDrop category="documents" config={BUILDER_UPLOADS.documents} files={uploads.documents} onChange={onUploadChange} />
      </Section>
      <Section title="Who provides and approves the content?">
        <ChoiceGrid options={CONTENT_RESPONSIBILITY} selected={c.responsibility} onToggle={set('responsibility')} columns={3} />
      </Section>
      <TextField label="Anything else we should know?" value={c.notes} onChange={set('notes')} multiline maxLength={1000} />
    </section>
  );
}

export function StepDomain({ state, updateSection, priceList }) {
  const d = state.domain;
  const set = (key) => (value) => updateSection('domain', { [key]: value });
  const rp = priceList.recurring;
  return (
    <section className="bld-step">
      <StepHeader title="Domain & hosting" subtitle="Your web address and where the website lives. Recurring costs are shown separately from the build." />
      <Section title="Domain name">
        <Question label="Do you already own a domain (e.g. yourbusiness.com)?" options={YES_NO_UNSURE.slice(0, 2)} value={d.ownsDomain} onChange={set('ownsDomain')} />
        {d.ownsDomain === 'yes' && <TextField label="Your domain" value={d.domainName} onChange={set('domainName')} maxLength={120} placeholder="yourbusiness.com" required />}
        {d.ownsDomain === 'no' && (
          <>
            <Checkbox label="Help me choose and register a domain" checked={d.wantsDomainHelp} onChange={set('wantsDomainHelp')} />
            {d.wantsDomainHelp && <TextField label="Any name ideas?" value={d.domainIdeas} onChange={set('domainIdeas')} maxLength={300} placeholder="amaskitchen.com, amaskitchen.com.gh" />}
          </>
        )}
      </Section>
      <Section title="Hosting">
        <ChoiceGrid options={HOSTING_OPTIONS} selected={d.hosting} onToggle={set('hosting')} columns={3} />
      </Section>
      <Section title="Maintenance after launch">
        <ChoiceGrid
          options={MAINTENANCE_OPTIONS.map((m) => ({ ...m, description: rp.maintenancePerMonth[m.id] ? `${formatCedis(rp.maintenancePerMonth[m.id])}/month` : 'You manage updates' }))}
          selected={d.maintenance}
          onToggle={set('maintenance')}
          columns={3}
        />
      </Section>
      <div className="bld-callout bld-callout--info">
        <strong>What's included and what recurs</strong>
        <ul>
          <li>One-time: domain connection, hosting setup and SSL certificate installation (shown in your estimate when selected).</li>
          <li>
            Every year: domain renewal (about {formatCedis(rp.domainComPerYear)} for .com, {formatCedis(rp.domainComGhPerYear)} for .com.gh) and hosting (from{' '}
            {formatCedis(rp.hostingPerYear.simple)}/year).
          </li>
          <li>Backups and updates after launch are only included if you choose a maintenance plan.</li>
          <li>These recurring services are not free — they are paid to providers or WebCraft and renew until cancelled.</li>
        </ul>
      </div>
    </section>
  );
}
