/**
 * Budget-aware pricing engine for the WebCraft website builder.
 * Pure functions only — no React, no Firebase — so it can be unit tested in Node.
 *
 * Every number produced here is an ESTIMATE. Final quotations require WebCraft approval.
 */
import {
  BUDGET_MAX,
  FEATURE_OPTIONS,
  LANGUAGE_OPTIONS,
  PAGE_OPTIONS,
  PAYMENT_METHODS,
  VISUAL_STYLES,
  WEBSITE_TYPES,
  labelOf,
} from '../data/builder/builderOptions.js';
import { DEFAULT_PRICE_LIST } from '../data/builder/defaultPriceList.js';

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

/** Deep-merge a (possibly partial) remote price list onto the defaults. */
export function mergePriceList(remote) {
  const merge = (base, override) => {
    if (!isPlainObject(override)) return base;
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
      if (isPlainObject(value) && isPlainObject(base?.[key])) {
        result[key] = merge(base[key], value);
      } else if (value !== undefined && value !== null) {
        result[key] = value;
      }
    }
    return result;
  };
  return merge(DEFAULT_PRICE_LIST, remote);
}

const num = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

export function roundTo(value, step) {
  const size = num(step) || 1;
  return Math.round(value / size) * size;
}

/** Features that become required because of other selections. */
export function resolveFeatureDependencies(state) {
  const selected = new Set(state.features ?? []);
  selected.add('responsive');
  const autoAdded = [];

  const add = (featureId, reason) => {
    if (!selected.has(featureId)) {
      selected.add(featureId);
      autoAdded.push({ id: featureId, label: labelOf(FEATURE_OPTIONS, featureId), reason });
    }
  };

  for (const pageId of state.pages ?? []) {
    const page = PAGE_OPTIONS.find((item) => item.id === pageId);
    for (const required of page?.requires ?? []) {
      add(required, `Required by the "${page.label}" page`);
    }
  }

  // Feature → feature dependencies
  if (selected.has('shopping-cart')) add('online-payments', 'A shopping cart needs online payments');
  if (selected.has('inventory')) add('admin-dashboard', 'Inventory is managed from an admin dashboard');
  if (selected.has('reviews')) add('admin-dashboard', 'Submitted reviews need moderation in an admin dashboard');
  if (selected.has('automated-notifications')) add('email-notifications', 'Automated notifications build on email notifications');

  const ecommerce = state.ecommerce ?? {};
  if (ecommerce.inventory === 'yes') add('inventory', 'You asked for inventory tracking');
  if (ecommerce.orderConfirmations === 'yes') add('email-notifications', 'Order confirmations are sent by email');

  // Run the feature→feature rules again for anything just added.
  if (selected.has('inventory')) add('admin-dashboard', 'Inventory is managed from an admin dashboard');

  return { features: [...selected], autoAdded };
}

export function isEcommerceRelevant(state) {
  const features = new Set(state.features ?? []);
  return (
    state.type === 'ecommerce' ||
    (state.purposes ?? []).includes('sell-online') ||
    (state.pages ?? []).includes('cart-checkout') ||
    features.has('shopping-cart') ||
    features.has('online-payments')
  );
}

/**
 * Calculate the full estimate.
 * @returns {object} pricing breakdown
 */
export function calculateEstimate(state, priceListInput) {
  const prices = priceListInput ? mergePriceList(priceListInput) : DEFAULT_PRICE_LIST;
  const lineItems = [];
  const manualReview = [];
  const included = [];
  const excluded = [];
  const assumptions = [];

  const push = (category, id, label, amount, note) => {
    const value = Math.max(0, num(amount));
    lineItems.push({ category, id, label, amount: value, note: note || '' });
    return value;
  };

  // ---- Base -------------------------------------------------------------
  const typeId = state.type || 'other';
  push('Base', `type:${typeId}`, `${labelOf(WEBSITE_TYPES, typeId)} — base build (Home page + responsive layout)`, prices.baseByType[typeId]);
  if (state.type && prices.manualReviewTypes.includes(typeId)) {
    manualReview.push({ id: `type:${typeId}`, label: labelOf(WEBSITE_TYPES, typeId), reason: 'This project type needs a requirements review before quoting.' });
  }

  // ---- Pages ------------------------------------------------------------
  const pages = [...new Set(state.pages ?? [])].filter((id) => id !== 'home');
  for (const pageId of pages) {
    const label = labelOf(PAGE_OPTIONS, pageId);
    if (pageId === 'service-details') {
      const count = Math.max(1, Math.min(50, num(state.serviceCount) || 1));
      push('Pages', pageId, `${label} × ${count}`, num(prices.pages[pageId]) * count);
    } else {
      push('Pages', pageId, `${label} page`, prices.pages[pageId]);
    }
  }
  for (const [index, extra] of (state.extraPages ?? []).entries()) {
    if (!extra?.name?.trim()) continue;
    const complexity = extra.complexity === 'complex' ? 'complex' : 'simple';
    push('Pages', `extra:${index}`, `Extra page: ${extra.name.trim()} (${complexity})`, prices.extraPage[complexity]);
    if (complexity === 'complex') {
      manualReview.push({ id: `extra:${index}`, label: `Extra page: ${extra.name.trim()}`, reason: 'Complex custom pages are estimated after review.' });
    }
  }

  // ---- Features (deduplicated, with dependencies) -----------------------
  const { features, autoAdded } = resolveFeatureDependencies(state);
  for (const featureId of features) {
    const amount = num(prices.features[featureId]);
    const label = labelOf(FEATURE_OPTIONS, featureId);
    if (amount > 0) push('Features', featureId, label, amount);
    else included.push(label);
    if (prices.manualReviewFeatures.includes(featureId)) {
      manualReview.push({ id: featureId, label, reason: 'Scope depends on your exact requirements or third-party providers.' });
    }
  }

  // Bundles (never double-count shared work)
  let bundleDiscount = 0;
  const appliedBundles = [];
  for (const bundle of prices.bundles ?? []) {
    if (bundle.features.every((id) => features.includes(id))) {
      bundleDiscount += num(bundle.discount);
      appliedBundles.push({ id: bundle.id, label: bundle.label, discount: num(bundle.discount) });
    }
  }

  // ---- Design ------------------------------------------------------------
  const style = state.style ?? {};
  const branding = state.branding ?? {};
  const styleSurcharge = num(prices.design.styleSurcharge?.[style.styleId]);
  if (styleSurcharge) push('Design', `style:${style.styleId}`, `${labelOf(VISUAL_STYLES, style.styleId)} visual style`, styleSurcharge);
  const modeCost = num(prices.design.colorMode?.[style.colorMode]);
  if (modeCost) push('Design', 'color-mode', 'Light + dark mode', modeCost);
  if (branding.themeId === 'custom' && num(prices.design.customColors)) push('Design', 'custom-colors', 'Custom colour palette', prices.design.customColors);
  if (branding.wantsLogoDesign) push('Design', 'logo-design', 'Logo design', prices.design.logoDesign);
  if (branding.hasGuidelines === 'no' && branding.wantsGuidelinesHelp) push('Design', 'brand-guidelines', 'Basic brand guidelines', prices.design.brandGuidelinesHelp);

  // ---- Content ------------------------------------------------------------
  const text = state.text ?? {};
  const content = state.content ?? {};
  const pageCount = pages.length + 1 + (state.extraPages ?? []).filter((p) => p?.name?.trim()).length;
  if (text.copywritingHelp) push('Content', 'copywriting', `Professional copywriting × ${pageCount} pages`, num(prices.content.copywritingPerPage) * pageCount);
  const extraLanguages = (text.languages ?? []).filter((id) => id !== 'en');
  if (extraLanguages.length) {
    push(
      'Content',
      'languages',
      `Extra languages: ${extraLanguages.map((id) => labelOf(LANGUAGE_OPTIONS, id)).join(', ')}`,
      num(prices.content.extraLanguagePerLanguage) * extraLanguages.length,
      'Translation of supplied text; final copy approved by you.'
    );
  }
  if (content.wantsAssetSourcing) push('Content', 'asset-sourcing', 'Sourcing suitable stock images & icons', prices.content.assetSourcingFlat);

  // ---- E-commerce ---------------------------------------------------------
  if (isEcommerceRelevant(state)) {
    const ec = state.ecommerce ?? {};
    const ep = prices.ecommerce;
    if (ec.productCount) {
      push('E-commerce', 'product-count', `Catalogue setup (${ec.productCount} products)`, ep.productCount?.[ec.productCount]);
      if (ep.productCountManualReview.includes(ec.productCount)) {
        manualReview.push({ id: 'product-count', label: 'Large product catalogue', reason: 'Catalogues over 500 products need an import plan.' });
      }
    }
    if (ec.variations === 'yes') push('E-commerce', 'variations', 'Product variations (size, colour…)', ep.variations);
    if (ec.discountCodes === 'yes') push('E-commerce', 'discount-codes', 'Discount codes', ep.discountCodes);
    if (ec.deliveryRules === 'yes') push('E-commerce', 'delivery-rules', 'Delivery fees & shipping rules', ep.deliveryRules);
    if (ec.orderTracking === 'yes') push('E-commerce', 'order-tracking', 'Order tracking', ep.orderTracking);
    if (ec.orderConfirmations === 'yes') push('E-commerce', 'order-confirmations', 'Order confirmation messages', ep.orderConfirmations);
    if ((ec.sellTypes ?? []).includes('digital')) push('E-commerce', 'digital-delivery', 'Digital product delivery', ep.digitalDelivery);
    for (const method of ec.paymentMethods ?? []) {
      const amount = num(ep.paymentMethod?.[method]);
      const label = `Payment method: ${labelOf(PAYMENT_METHODS, method)}`;
      if (amount) push('E-commerce', `pay:${method}`, label, amount);
      if (ep.paymentMethodManualReview.includes(method)) {
        manualReview.push({ id: `pay:${method}`, label, reason: 'Advanced payment integrations need review.' });
      }
    }
    if (ec.advancedNotes?.trim()) {
      manualReview.push({ id: 'ecommerce-advanced', label: 'Advanced store integrations', reason: ec.advancedNotes.trim().slice(0, 200) });
    }
    assumptions.push('Payment gateway transaction fees are charged by the provider and are not part of this estimate.');
  }

  // ---- Domain / hosting setup -------------------------------------------
  const domain = state.domain ?? {};
  if (domain.ownsDomain === 'yes' || domain.wantsDomainHelp) push('Setup', 'domain-setup', 'Domain connection & DNS setup', prices.setup.domainSetup);
  if (domain.hosting === 'webcraft') push('Setup', 'hosting-setup', 'Hosting setup & deployment (incl. SSL)', num(prices.setup.hostingSetup) + num(prices.setup.sslSetup));

  // ---- Totals --------------------------------------------------------------
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const devTotalRaw = Math.max(0, subtotal - bundleDiscount);
  const estimate = roundTo(devTotalRaw, prices.rounding);
  const spread = num(prices.rangePercent) / 100;
  const range = {
    low: roundTo(estimate * (1 - spread), prices.rounding),
    high: roundTo(estimate * (1 + spread), prices.rounding),
  };

  // ---- Recurring (separate from development cost) -------------------------
  const recurring = [];
  const rp = prices.recurring;
  if (domain.ownsDomain !== 'yes') {
    const isGh = (domain.domainName || domain.domainIdeas || '').toLowerCase().includes('.gh');
    recurring.push({
      id: 'domain',
      label: `Domain name registration (${isGh ? '.com.gh' : '.com or similar'})`,
      amount: isGh ? rp.domainComGhPerYear : rp.domainComPerYear,
      period: 'year',
    });
  } else {
    recurring.push({ id: 'domain', label: 'Domain renewal (paid to your current registrar)', amount: 0, period: 'year', note: 'Your existing registrar fee applies.' });
  }
  if (domain.hosting !== 'own') {
    const plan = isEcommerceRelevant(state) ? 'ecommerce' : features.includes('customer-accounts') || features.includes('admin-dashboard') ? 'standard' : 'simple';
    recurring.push({ id: 'hosting', label: `Hosting (${plan} plan)`, amount: rp.hostingPerYear[plan], period: 'year' });
  }
  const maintenance = domain.maintenance || 'none';
  if (maintenance !== 'none') {
    recurring.push({ id: 'maintenance', label: `${maintenance === 'basic' ? 'Basic' : 'Standard'} maintenance plan`, amount: rp.maintenancePerMonth[maintenance], period: 'month' });
  } else {
    excluded.push('Ongoing maintenance, updates and backups after launch (no plan selected).');
  }
  const notes = [];
  if (features.includes('online-payments')) notes.push(rp.paymentGatewayFeeNote);
  if (features.includes('automated-notifications')) notes.push(rp.smsNote);

  // ---- Budget comparison --------------------------------------------------
  const budgetAmount = num(state.budget?.amount);
  const remaining = budgetAmount - estimate;
  const overBudget = budgetAmount > 0 && remaining < 0;
  const exceedsBuilderCap = estimate > BUDGET_MAX;

  // ---- Lower-cost alternatives -------------------------------------------
  const suggestions = [];
  for (const featureId of features) {
    const alt = prices.alternatives?.[featureId];
    if (!alt) continue;
    const autoReason = autoAdded.find((item) => item.id === featureId);
    const currentCost = num(prices.features[featureId]);
    const replacementCost = alt.replaceWith && !features.includes(alt.replaceWith) ? num(prices.features[alt.replaceWith]) : 0;
    const saving = currentCost - replacementCost;
    if (saving <= 0) continue;
    suggestions.push({
      featureId,
      label: labelOf(FEATURE_OPTIONS, featureId),
      replaceWith: alt.replaceWith,
      replaceLabel: alt.replaceWith ? labelOf(FEATURE_OPTIONS, alt.replaceWith) : null,
      note: alt.note,
      saving,
      lockedBy: autoReason?.reason ?? null,
    });
  }
  suggestions.sort((a, b) => b.saving - a.saving);

  assumptions.push(
    'Prices are estimates based on typical requirements and may change after WebCraft reviews your brief.',
    'Third-party fees (domain, hosting, payment gateways, SMS) are shown separately and paid to providers.',
  );
  if (manualReview.length) assumptions.push('Items marked for manual review are priced after a short consultation.');
  excluded.push('Paid stock photography, premium plugins or licences unless listed above.');

  return {
    lineItems,
    subtotal,
    bundleDiscount,
    appliedBundles,
    estimate,
    range,
    features,
    autoAdded,
    included,
    excluded,
    manualReview,
    needsManualReview: manualReview.length > 0,
    recurring,
    notes,
    assumptions,
    budget: { amount: budgetAmount, remaining, overBudget, overBy: overBudget ? -remaining : 0 },
    exceedsBuilderCap,
    suggestions,
    priceListVersion: prices.version,
  };
}

/** Apply a suggestion to a builder state (returns a new state). */
export function applySuggestion(state, suggestion) {
  const DEPENDENTS = {
    'online-payments': ['shopping-cart'],
    'admin-dashboard': ['inventory', 'reviews'],
    'email-notifications': ['automated-notifications'],
  };
  const removed = new Set([suggestion.featureId, ...(DEPENDENTS[suggestion.featureId] ?? [])]);
  const features = new Set((state.features ?? []).filter((id) => !removed.has(id)));
  if (suggestion.replaceWith) features.add(suggestion.replaceWith);
  const pages = (state.pages ?? []).filter((pageId) => {
    const page = PAGE_OPTIONS.find((item) => item.id === pageId);
    return !(page?.requires ?? []).some((id) => removed.has(id));
  });
  const ecommerce = { ...(state.ecommerce ?? {}) };
  if (removed.has('inventory')) ecommerce.inventory = 'no';
  if (removed.has('email-notifications')) ecommerce.orderConfirmations = 'no';
  return { ...state, features: [...features], pages, ecommerce };
}

export const formatCedis = (value) => `GH₵${Math.round(num(value)).toLocaleString('en-GH')}`;
