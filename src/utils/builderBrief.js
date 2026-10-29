/**
 * Turns builder state + pricing into a structured, sanitized project specification
 * and a plain-text project brief (used for the summary, admin export and quotations).
 */
import {
  COLOR_MODES,
  COLOR_THEMES,
  CONTACT_METHODS,
  CONTENT_RESPONSIBILITY,
  CONTENT_STATUS,
  ECOMMERCE_SELL_TYPES,
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
} from '../data/builder/builderOptions.js';
import { formatCedis, isEcommerceRelevant } from './builderPricing.js';
import { normalizeHex } from './colorContrast.js';

const clip = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const ids = (list, valid, max = 40) => [...new Set(Array.isArray(list) ? list : [])].filter((id) => valid.some((item) => item.id === id)).slice(0, max);
const pick = (value, valid) => (valid.some((item) => item.id === value) ? value : '');

export function buildSpec(state, pricing) {
  const budgetAmount = Math.round(Number(state.budget?.amount) || 0);
  const tier = getTierForAmount(budgetAmount);
  const ecommerceRelevant = isEcommerceRelevant(state);

  return {
    budget: { amount: budgetAmount, tier: tier?.label ?? 'Custom' },
    websiteType: pick(state.type, WEBSITE_TYPES) || 'other',
    purposes: ids(state.purposes, WEBSITE_PURPOSES),
    goalText: clip(state.goalText, 1000),
    pages: ids(state.pages, PAGE_OPTIONS),
    serviceCount: Math.min(50, Math.max(0, Number(state.serviceCount) || 0)),
    extraPages: (state.extraPages ?? [])
      .filter((page) => clip(page?.name, 80))
      .slice(0, 15)
      .map((page) => ({ name: clip(page.name, 80), complexity: page.complexity === 'complex' ? 'complex' : 'simple', notes: clip(page.notes, 300) })),
    branding: {
      themeId: pick(state.branding?.themeId, COLOR_THEMES) || 'custom',
      primary: normalizeHex(state.branding?.primary) ?? '#2563eb',
      secondary: normalizeHex(state.branding?.secondary) ?? '#ffffff',
      accent: normalizeHex(state.branding?.accent) ?? '#f59e0b',
      hasGuidelines: clip(state.branding?.hasGuidelines, 10),
      guidelinesNotes: clip(state.branding?.guidelinesNotes, 1000),
      wantsGuidelinesHelp: Boolean(state.branding?.wantsGuidelinesHelp),
      wantsLogoDesign: Boolean(state.branding?.wantsLogoDesign),
    },
    style: {
      styleId: pick(state.style?.styleId, VISUAL_STYLES) || 'modern',
      colorMode: pick(state.style?.colorMode, COLOR_MODES) || 'light',
      fontId: pick(state.style?.fontId, FONT_PAIRINGS) || 'inter',
      references: (state.style?.references ?? [])
        .filter((ref) => clip(ref?.url, 300))
        .slice(0, 5)
        .map((ref) => ({ url: clip(ref.url, 300), likes: clip(ref.likes, 500) })),
    },
    text: {
      projectName: clip(state.text?.projectName, 120),
      headline: clip(state.text?.headline, 200),
      description: clip(state.text?.description, 1000),
      ctaPrimary: clip(state.text?.ctaPrimary, 60),
      ctaSecondary: clip(state.text?.ctaSecondary, 60),
      offerings: clip(state.text?.offerings, 3000),
      existingText: clip(state.text?.existingText, 5000),
      existingSiteUrl: clip(state.text?.existingSiteUrl, 300),
      brandTerms: clip(state.text?.brandTerms, 500),
      copywritingHelp: Boolean(state.text?.copywritingHelp),
      languages: ids(state.text?.languages, LANGUAGE_OPTIONS, 6),
    },
    features: ids(pricing?.features ?? state.features, FEATURE_OPTIONS),
    ecommerce: ecommerceRelevant
      ? {
          sellTypes: ids(state.ecommerce?.sellTypes, ECOMMERCE_SELL_TYPES),
          productCount: pick(state.ecommerce?.productCount, PRODUCT_COUNT_OPTIONS),
          variations: clip(state.ecommerce?.variations, 10),
          inventory: clip(state.ecommerce?.inventory, 10),
          discountCodes: clip(state.ecommerce?.discountCodes, 10),
          paymentMethods: ids(state.ecommerce?.paymentMethods, PAYMENT_METHODS),
          deliveryRules: clip(state.ecommerce?.deliveryRules, 10),
          orderTracking: clip(state.ecommerce?.orderTracking, 10),
          orderConfirmations: clip(state.ecommerce?.orderConfirmations, 10),
          advancedNotes: clip(state.ecommerce?.advancedNotes, 1000),
        }
      : null,
    content: {
      hasText: pick(state.content?.hasText, CONTENT_STATUS),
      hasLogo: pick(state.content?.hasLogo, CONTENT_STATUS),
      hasProductPhotos: pick(state.content?.hasProductPhotos, CONTENT_STATUS),
      hasBusinessPhotos: pick(state.content?.hasBusinessPhotos, CONTENT_STATUS),
      wantsAssetSourcing: Boolean(state.content?.wantsAssetSourcing),
      responsibility: pick(state.content?.responsibility, CONTENT_RESPONSIBILITY),
      notes: clip(state.content?.notes, 1000),
    },
    domain: {
      ownsDomain: clip(state.domain?.ownsDomain, 10),
      domainName: clip(state.domain?.domainName, 120),
      wantsDomainHelp: Boolean(state.domain?.wantsDomainHelp),
      domainIdeas: clip(state.domain?.domainIdeas, 300),
      hosting: pick(state.domain?.hosting, HOSTING_OPTIONS),
      maintenance: pick(state.domain?.maintenance, MAINTENANCE_OPTIONS) || 'none',
    },
  };
}

/** Identify content that is still missing before final approval. */
export function findMissingContent(state) {
  const missing = [];
  const c = state.content ?? {};
  const t = state.text ?? {};
  if (!t.headline?.trim()) missing.push('Homepage headline');
  if (!t.description?.trim()) missing.push('Supporting description');
  if (!t.offerings?.trim() && (state.pages ?? []).some((p) => ['services', 'products', 'service-details'].includes(p))) {
    missing.push('Descriptions of your products or services');
  }
  if (c.hasLogo !== 'ready' && !state.branding?.wantsLogoDesign) missing.push('Logo (upload one or request logo design)');
  if (c.hasText === 'none' && !t.copywritingHelp) missing.push('Website text (provide it or add copywriting help)');
  if (isEcommerceRelevant(state) && c.hasProductPhotos !== 'ready') missing.push('Product photos');
  if (c.hasBusinessPhotos === 'none' && !c.wantsAssetSourcing) missing.push('Business photos (provide them or ask us to source images)');
  return missing;
}

const yn = (value) => ({ yes: 'Yes', no: 'No', unsure: 'Not sure' }[value] ?? '—');

export function buildBriefText({ receiptId, spec, estimate, customer, missingContent = [] }) {
  const lines = [];
  const add = (line = '') => lines.push(line);

  add(`WEBCRAFT PROJECT BRIEF${receiptId ? ` — ${receiptId}` : ''}`);
  add('='.repeat(48));
  if (customer) {
    add(`Client: ${customer.fullName || '—'}${customer.businessName ? ` (${customer.businessName})` : ''}`);
    add(`Contact: ${customer.email || '—'} | ${customer.phone || '—'} | prefers ${labelOf(CONTACT_METHODS, customer.contactMethod)}`);
    if (customer.timeline) add(`Timeline: ${labelOf(TIMELINE_OPTIONS, customer.timeline)}`);
    add();
  }
  add(`Budget: ${formatCedis(spec.budget.amount)} (${spec.budget.tier})`);
  add(`Website type: ${labelOf(WEBSITE_TYPES, spec.websiteType)}`);
  add(`Goals: ${spec.purposes.map((id) => labelOf(WEBSITE_PURPOSES, id)).join(', ') || '—'}`);
  if (spec.goalText) add(`Main goal (client's words): ${spec.goalText}`);
  add();
  add('PAGES');
  for (const id of spec.pages) {
    add(`  • ${labelOf(PAGE_OPTIONS, id)}${id === 'service-details' ? ` × ${spec.serviceCount}` : ''}`);
  }
  for (const page of spec.extraPages) add(`  • ${page.name} (extra, ${page.complexity})${page.notes ? ` — ${page.notes}` : ''}`);
  add();
  add('BRANDING & DESIGN');
  add(`  Colours: ${labelOf(COLOR_THEMES, spec.branding.themeId)} — primary ${spec.branding.primary}, secondary ${spec.branding.secondary}, accent ${spec.branding.accent}`);
  add(`  Style: ${labelOf(VISUAL_STYLES, spec.style.styleId)} | ${labelOf(COLOR_MODES, spec.style.colorMode)}`);
  add(`  Fonts: ${labelOf(FONT_PAIRINGS, spec.style.fontId)}`);
  add(`  Brand guidelines: ${yn(spec.branding.hasGuidelines)}${spec.branding.guidelinesNotes ? ` — ${spec.branding.guidelinesNotes}` : ''}`);
  if (spec.branding.wantsLogoDesign) add('  Logo design requested');
  for (const ref of spec.style.references) add(`  Reference: ${ref.url}${ref.likes ? ` — likes: ${ref.likes}` : ''}`);
  add();
  add('TEXT');
  add(`  Name: ${spec.text.projectName || '—'}`);
  add(`  Headline: ${spec.text.headline || '—'}`);
  add(`  Description: ${spec.text.description || '—'}`);
  add(`  Calls to action: ${[spec.text.ctaPrimary, spec.text.ctaSecondary].filter(Boolean).join(' / ') || '—'}`);
  if (spec.text.offerings) add(`  Products/services: ${spec.text.offerings}`);
  if (spec.text.brandTerms) add(`  Brand terms to preserve: ${spec.text.brandTerms}`);
  if (spec.text.existingSiteUrl) add(`  Existing site: ${spec.text.existingSiteUrl}`);
  add(`  Languages: ${spec.text.languages.map((id) => labelOf(LANGUAGE_OPTIONS, id)).join(', ')}`);
  add(`  Copywriting help: ${spec.text.copywritingHelp ? 'Yes' : 'No'}`);
  add();
  add('FEATURES');
  for (const id of spec.features) add(`  • ${labelOf(FEATURE_OPTIONS, id)}`);
  if (spec.ecommerce) {
    add();
    add('E-COMMERCE');
    add(`  Sells: ${spec.ecommerce.sellTypes.map((id) => labelOf(ECOMMERCE_SELL_TYPES, id)).join(', ') || '—'}`);
    add(`  Products: ${labelOf(PRODUCT_COUNT_OPTIONS, spec.ecommerce.productCount) || '—'}`);
    add(`  Variations: ${yn(spec.ecommerce.variations)} | Inventory: ${yn(spec.ecommerce.inventory)} | Discount codes: ${yn(spec.ecommerce.discountCodes)}`);
    add(`  Delivery rules: ${yn(spec.ecommerce.deliveryRules)} | Order tracking: ${yn(spec.ecommerce.orderTracking)} | Confirmations: ${yn(spec.ecommerce.orderConfirmations)}`);
    add(`  Payments: ${spec.ecommerce.paymentMethods.map((id) => labelOf(PAYMENT_METHODS, id)).join(', ') || '—'}`);
    if (spec.ecommerce.advancedNotes) add(`  Advanced: ${spec.ecommerce.advancedNotes}`);
  }
  add();
  add('CONTENT & ASSETS');
  add(`  Text ready: ${labelOf(CONTENT_STATUS, spec.content.hasText) || '—'} | Logo: ${labelOf(CONTENT_STATUS, spec.content.hasLogo) || '—'}`);
  add(`  Product photos: ${labelOf(CONTENT_STATUS, spec.content.hasProductPhotos) || '—'} | Business photos: ${labelOf(CONTENT_STATUS, spec.content.hasBusinessPhotos) || '—'}`);
  add(`  Responsibility: ${labelOf(CONTENT_RESPONSIBILITY, spec.content.responsibility) || '—'}`);
  if (spec.content.wantsAssetSourcing) add('  WebCraft to source visual assets');
  if (missingContent.length) add(`  Still missing: ${missingContent.join('; ')}`);
  add();
  add('DOMAIN & HOSTING');
  add(`  Owns domain: ${yn(spec.domain.ownsDomain)}${spec.domain.domainName ? ` (${spec.domain.domainName})` : ''}`);
  if (spec.domain.wantsDomainHelp) add(`  Wants help choosing a domain${spec.domain.domainIdeas ? `: ${spec.domain.domainIdeas}` : ''}`);
  add(`  Hosting: ${labelOf(HOSTING_OPTIONS, spec.domain.hosting) || '—'} | Maintenance: ${labelOf(MAINTENANCE_OPTIONS, spec.domain.maintenance)}`);
  if (estimate) {
    add();
    add('ESTIMATE (subject to WebCraft review)');
    add(`  Development estimate: ${formatCedis(estimate.amount)} (range ${formatCedis(estimate.low)} – ${formatCedis(estimate.high)})`);
    for (const item of estimate.lineItems ?? []) add(`    ${item.label}: ${formatCedis(item.amount)}`);
    if (estimate.bundleDiscount) add(`    Bundle savings: −${formatCedis(estimate.bundleDiscount)}`);
    if (estimate.overBudget) add(`  ⚠ Over budget by ${formatCedis(estimate.amount - spec.budget.amount)} (client acknowledged)`);
    for (const item of estimate.manualReview ?? []) add(`  ⚑ Manual review: ${item.label} — ${item.reason}`);
    add('  Recurring / third-party (separate):');
    for (const item of estimate.recurring ?? []) add(`    ${item.label}: ${item.amount ? `${formatCedis(item.amount)}/${item.period}` : item.note ?? '—'}`);
  }
  return lines.join('\n');
}

export function buildCustomEstimateBrief({ receiptId, data }) {
  return [
    `WEBCRAFT CUSTOM ESTIMATE REQUEST${receiptId ? ` — ${receiptId}` : ''}`,
    '='.repeat(48),
    `Client: ${data.fullName}${data.businessName ? ` (${data.businessName})` : ''}`,
    `Contact: ${data.email} | ${data.phone || '—'} | prefers ${labelOf(CONTACT_METHODS, data.contactMethod)}`,
    `Budget range: ${data.budgetRange || 'Not specified'}`,
    `Preferred completion: ${data.completionDate || 'Flexible'}`,
    '',
    'PROJECT DESCRIPTION',
    data.description,
    '',
    'DESIRED FUNCTIONALITY',
    data.functionality || '—',
  ].join('\n');
}
