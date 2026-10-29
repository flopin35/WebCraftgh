/**
 * Unit tests for the website builder pricing engine + helpers.
 * Run: npm run test:builder
 */
import { calculateEstimate, applySuggestion, mergePriceList, resolveFeatureDependencies, roundTo } from '../src/utils/builderPricing.js';
import { contrastRatio, readableTextOn } from '../src/utils/colorContrast.js';
import { validateBuilderStep, validateCustomEstimate } from '../src/utils/builderValidation.js';
import { getTierForAmount, BUDGET_MIN, BUDGET_MAX, BUDGET_STEP } from '../src/data/builder/builderOptions.js';
import { DEFAULT_PRICE_LIST } from '../src/data/builder/defaultPriceList.js';
import { createInitialBuilderState } from '../src/data/builder/initialState.js';
import { buildSpec, buildBriefText, findMissingContent } from '../src/utils/builderBrief.js';
import { draftWebsiteCopy } from '../src/utils/copyDrafts.js';
import { readFileSync } from 'node:fs';

let passed = 0;
let failed = 0;
function assert(condition, name, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

const base = () => ({ ...createInitialBuilderState(), type: 'business', budget: { amount: 3000 } });

console.log('\nBudget tiers');
for (let amount = BUDGET_MIN; amount <= BUDGET_MAX; amount += BUDGET_STEP) {
  if (!getTierForAmount(amount)) assert(false, `amount ${amount} maps to a tier`);
}
assert(true, 'every slider value between 1,000 and 10,000 maps to a tier');
assert(getTierForAmount(1900).id === 'tier-1' && getTierForAmount(2000).id === 'tier-2', 'tier boundaries 1,900 / 2,000');
assert(getTierForAmount(6000).id === 'tier-3' && getTierForAmount(6100).id === 'tier-4', 'tier boundaries 6,000 / 6,100');
assert(getTierForAmount(10100) === null, 'amounts above GH₵10,000 are outside the standard builder');

console.log('\nBase calculation');
{
  const state = { ...base(), pages: ['home'], features: [] };
  const result = calculateEstimate(state);
  assert(result.estimate === DEFAULT_PRICE_LIST.baseByType.business, 'home-only business site equals base price', `${result.estimate}`);
  assert(result.features.includes('responsive'), 'responsive layout always included');
  assert(result.budget.remaining === 3000 - result.estimate, 'remaining budget computed');
}

console.log('\nPages & dependencies');
{
  const state = { ...base(), pages: ['home', 'blog', 'booking', 'cart-checkout'], features: [] };
  const { features, autoAdded } = resolveFeatureDependencies(state);
  assert(features.includes('blog-cms'), 'blog page adds blog CMS');
  assert(features.includes('booking-system'), 'booking page adds booking system');
  assert(features.includes('shopping-cart') && features.includes('online-payments'), 'checkout adds cart + payments');
  assert(autoAdded.length >= 4, 'auto-added features are reported with reasons');
}
{
  const state = { ...base(), pages: ['home'], features: ['inventory'] };
  const { features } = resolveFeatureDependencies(state);
  assert(features.includes('admin-dashboard'), 'inventory adds admin dashboard');
}
{
  const state = { ...base(), pages: ['home', 'service-details'], serviceCount: 4 };
  const result = calculateEstimate(state);
  const item = result.lineItems.find((line) => line.id === 'service-details');
  assert(item.amount === DEFAULT_PRICE_LIST.pages['service-details'] * 4, 'service detail pages priced per service');
}

console.log('\nNo double counting');
{
  const state = { ...base(), pages: ['home', 'admin-dashboard'], features: ['admin-dashboard', 'admin-dashboard'] };
  const result = calculateEstimate(state);
  const count = result.lineItems.filter((line) => line.id === 'admin-dashboard' && line.category === 'Features').length;
  assert(count === 1, 'a feature selected twice / required by a page is counted once');
}
{
  const state = { ...base(), type: 'ecommerce', features: ['online-payments', 'shopping-cart', 'inventory'] };
  const result = calculateEstimate(state);
  assert(result.appliedBundles.some((b) => b.id === 'store-bundle'), 'store bundle discount applied');
  const sum = result.lineItems.reduce((s, l) => s + l.amount, 0) - result.bundleDiscount;
  assert(result.estimate === roundTo(sum, DEFAULT_PRICE_LIST.rounding), 'estimate = line items − bundle discounts (rounded)');
}

console.log('\nRounding');
assert(roundTo(1234, 50) === 1250 && roundTo(1224, 50) === 1200, 'rounds to nearest GH₵50');
{
  const result = calculateEstimate({ ...base(), pages: ['home', 'about', 'faq'] });
  assert(result.estimate % 50 === 0, 'estimate is a multiple of 50');
  assert(result.range.low <= result.estimate && result.range.high >= result.estimate, 'range brackets estimate');
}

console.log('\nBudget overrun & alternatives');
{
  const state = { ...base(), budget: { amount: 1500 }, features: ['booking-system', 'online-payments', 'customer-accounts'] };
  const result = calculateEstimate(state);
  assert(result.budget.overBudget, 'over-budget detected');
  assert(result.budget.overBy === result.estimate - 1500, 'overBy amount correct');
  assert(result.suggestions.length > 0 && result.suggestions[0].saving >= result.suggestions.at(-1).saving, 'suggestions sorted by saving');
  const next = applySuggestion(state, result.suggestions[0]);
  const after = calculateEstimate(next);
  assert(after.estimate < result.estimate, 'applying a suggestion lowers the estimate');
}
{
  const state = { ...base(), features: ['shopping-cart'] };
  const result = calculateEstimate(state);
  const payments = result.suggestions.find((s) => s.featureId === 'online-payments');
  const next = applySuggestion(state, payments);
  const after = calculateEstimate(next);
  assert(!after.features.includes('online-payments') && !after.features.includes('shopping-cart'), 'removing payments also removes dependent cart');
}

console.log('\nGH₵10,000 cap & manual review');
{
  const everything = {
    ...base(),
    type: 'membership',
    budget: { amount: 10000 },
    pages: ['home', 'about', 'services', 'products', 'product-details', 'cart-checkout', 'portfolio', 'gallery', 'blog', 'contact', 'faq', 'booking', 'auth', 'customer-dashboard', 'admin-dashboard', 'legal'],
    features: ['booking-system', 'online-payments', 'shopping-cart', 'inventory', 'customer-accounts', 'admin-dashboard', 'search', 'reviews', 'automated-notifications', 'animations'],
    text: { languages: ['en', 'tw', 'fr'], copywritingHelp: true },
  };
  const result = calculateEstimate(everything);
  assert(result.exceedsBuilderCap, 'very large configuration exceeds the standard-builder cap', `${result.estimate}`);
  assert(result.needsManualReview, 'automated notifications flagged for manual review');
}
{
  const result = calculateEstimate({ ...base(), type: 'web-app' });
  assert(result.manualReview.some((m) => m.id === 'type:web-app'), 'web applications always need manual review');
}

console.log('\nRecurring costs kept separate');
{
  const result = calculateEstimate({ ...base(), domain: { ownsDomain: 'no', hosting: 'webcraft', maintenance: 'basic' } });
  const recurringTotal = result.recurring.reduce((s, r) => s + r.amount, 0);
  assert(recurringTotal > 0, 'recurring costs listed');
  assert(!result.lineItems.some((l) => /renewal|per year|maintenance plan/i.test(l.label)), 'recurring fees not inside development estimate');
}

console.log('\nEditable price list');
{
  const custom = mergePriceList({ baseByType: { business: 5000 }, features: { whatsapp: 999 } });
  assert(custom.baseByType.business === 5000 && custom.baseByType.landing === DEFAULT_PRICE_LIST.baseByType.landing, 'partial override merges with defaults');
  const result = calculateEstimate({ ...base(), pages: ['home'], features: ['whatsapp'] }, { baseByType: { business: 5000 }, features: { whatsapp: 999 } });
  assert(result.estimate === roundTo(5999, 50), 'estimate uses edited prices', `${result.estimate}`);
}

console.log('\nColour contrast');
assert(Math.abs(contrastRatio('#000000', '#ffffff') - 21) < 0.01, 'black/white contrast is 21:1');
assert(readableTextOn('#111111') === '#ffffff' && readableTextOn('#ffffff') === '#111827', 'picks readable text colour');

console.log('\nValidation');
{
  const state = createInitialBuilderState();
  assert(!validateBuilderStep('type', state).isValid, 'type step requires a website type');
  assert(validateBuilderStep('budget', { ...state, budget: { amount: 2500 } }).isValid, 'budget 2,500 valid');
  assert(!validateBuilderStep('budget', { ...state, budget: { amount: 500 } }).isValid, 'budget below 1,000 rejected');
  assert(!validateBuilderStep('branding', { ...state, branding: { ...state.branding, primary: 'blue' } }).isValid, 'invalid hex rejected');
  const details = validateBuilderStep('details', { ...state, customer: { fullName: 'A', businessName: '', email: 'bad', phone: '', contactMethod: 'email', consent: false } });
  assert(!details.isValid && details.errors.length >= 2, 'details step validates email + consent');
  assert(!validateCustomEstimate({ description: '', fullName: '' }).isValid, 'custom estimate requires description & contact');
}

console.log('\nSecure handling of customer data');
{
  const hostile = {
    ...base(),
    type: 'evil-type',
    purposes: ['get-customers', '<script>'],
    pages: ['home', 'about', 'not-a-page'],
    features: ['whatsapp', 'drop-table'],
    goalText: 'x'.repeat(5000),
    branding: { ...base().branding, primary: 'javascript:alert(1)' },
    style: { ...base().style, references: Array.from({ length: 20 }, () => ({ url: 'https://a.com', likes: 'y'.repeat(900) })) },
  };
  const spec = buildSpec(hostile, calculateEstimate(hostile));
  assert(spec.websiteType === 'other', 'unknown website type replaced');
  assert(!spec.pages.includes('not-a-page') && !spec.purposes.includes('<script>'), 'unknown page/purpose ids stripped');
  assert(!spec.features.includes('drop-table'), 'unknown feature ids stripped');
  assert(spec.goalText.length === 1000, 'free text clipped to limit');
  assert(spec.branding.primary === '#2563eb', 'invalid colour replaced with safe default');
  assert(spec.style.references.length === 5 && spec.style.references[0].likes.length === 500, 'references limited and clipped');
  const brief = buildBriefText({ receiptId: 'WB-ABCDEFGH', spec, estimate: null, customer: { fullName: 'Ama', email: 'a@b.co', contactMethod: 'email' } });
  assert(brief.includes('WB-ABCDEFGH') && brief.includes('PAGES'), 'structured brief generated');
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  assert(/match \/websiteBuilderRequests\/\{receiptId\}[\s\S]*?allow read: if isAdmin\(\);/.test(rules), 'builder requests readable by admin only');
  assert(/match \/builderRequestStatus[\s\S]*?allow list: if isAdmin\(\);/.test(rules), 'status docs cannot be listed publicly');
  assert(/match \/siteConfig[\s\S]*?allow write: if isAdmin\(\);/.test(rules), 'price list writable by admin only');
  assert(rules.includes("hasOnly(['status', 'adminNotes', 'quote', 'quoteHistory', 'clarifications', 'updatedAt'])"), 'admin can only change review fields, not the brief');
  const storageRules = readFileSync(new URL('../storage.rules', import.meta.url), 'utf8');
  assert(storageRules.includes('websiteBuilderRequests/{receiptId}') && storageRules.includes('10 * 1024 * 1024'), 'builder uploads limited to 10MB in storage rules');
}

console.log('\nContent helpers');
{
  const state = { ...base(), text: { ...base().text, projectName: "Ama's Kitchen", offerings: 'Jollof rice - GH₵50' } };
  const draft = draftWebsiteCopy(state);
  assert(draft.headline.includes("Ama's Kitchen") && draft.headline.includes('Jollof rice'), 'draft copy preserves customer name and offering');
  assert(!/award|#1|best in/i.test(draft.description), 'draft copy makes no invented claims');
  const missing = findMissingContent({ ...base(), pages: ['home', 'services'] });
  assert(missing.includes('Homepage headline') && missing.some((m) => m.startsWith('Logo')), 'missing content identified');
}

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed ? 1 : 0);
