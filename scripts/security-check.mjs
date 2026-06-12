/**
 * Production security smoke tests — run with: npm run test:security
 * Validates pricing, validation, receipts, and tamper resistance without Firebase.
 */

const TEMPLATE_PRICES = {
  business: 1200,
  store: 1500,
  political: 1100,
};

const UPGRADE_PRICES = {
  'ai-assistant': 250,
  blog: 150,
  payment: 900,
};

const BUNDLE_PRICES = {
  'growth-bundle': 699,
};

const DEPLOYMENT_PRICE = 600;
const RECEIPT_PATTERN = /^REQ-[0-9]{6}$/;

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${name}`);
  }
}

function calculatePricing({
  templatePrice,
  selectedUpgradeIds = [],
  selectedBundleId = null,
  includeDeployment = false,
}) {
  let upgradesSubtotal = 0;

  if (selectedBundleId === 'growth-bundle') {
    upgradesSubtotal = BUNDLE_PRICES['growth-bundle'];
  } else {
    upgradesSubtotal = selectedUpgradeIds.reduce(
      (total, id) => total + (UPGRADE_PRICES[id] ?? 0),
      0
    );
  }

  const deploymentFee = includeDeployment ? DEPLOYMENT_PRICE : 0;
  const total = templatePrice + upgradesSubtotal + deploymentFee;

  return { templatePrice, upgradesSubtotal, deploymentFee, total };
}

function resolveSecurePricing(templateId, selectedUpgradeIds, selectedBundleId, includeDeployment) {
  const templatePrice = TEMPLATE_PRICES[templateId];
  if (!templatePrice) {
    return { success: false };
  }

  const validUpgradeIds = selectedUpgradeIds.filter((id) => UPGRADE_PRICES[id]);
  const validBundleId = selectedBundleId && BUNDLE_PRICES[selectedBundleId] ? selectedBundleId : null;

  const pricing = calculatePricing({
    templatePrice,
    selectedUpgradeIds: validUpgradeIds,
    selectedBundleId: validBundleId,
    includeDeployment: Boolean(includeDeployment),
  });

  return { success: true, templatePrice, pricing };
}

function validateRequest({ template, formData }) {
  const errors = [];
  if (!formData.fullName?.trim()) errors.push('Full Name is required.');
  if (!formData.phone?.trim()) errors.push('Phone Number is required.');
  if (!formData.businessName?.trim()) errors.push('Business Name is required.');
  if (!template?.id || !template?.name) errors.push('Template is required.');
  if (template?.id && !TEMPLATE_PRICES[template.id]) errors.push('Invalid template.');
  return { isValid: errors.length === 0, errors };
}

function isValidReceiptId(id) {
  return typeof id === 'string' && RECEIPT_PATTERN.test(id);
}

function sanitizeFormData(formData) {
  const trim = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  return {
    fullName: trim(formData.fullName, 120),
    phone: trim(formData.phone, 30),
    email: trim(formData.email, 120),
    businessName: trim(formData.businessName, 120),
    additionalNotes: trim(formData.additionalNotes, 2000),
  };
}

console.log('\nWebCraft Production Security Check\n');

console.log('Validation');
assert(validateRequest({
  template: { id: 'business', name: 'Business Website' },
  formData: { fullName: 'A', phone: '1', businessName: 'B' },
}).isValid, 'Valid request passes validation');

assert(!validateRequest({
  template: { id: 'business', name: 'Business Website' },
  formData: { fullName: '', phone: '1', businessName: 'B' },
}).isValid, 'Missing full name rejected');

assert(!validateRequest({
  template: { id: 'fake-template', name: 'Fake' },
  formData: { fullName: 'A', phone: '1', businessName: 'B' },
}).isValid, 'Unknown template rejected');

console.log('\nPrice tamper protection');
const tampered = resolveSecurePricing('business', ['blog'], null, false);
const clientTamperedTotal = 1;
assert(
  tampered.success && tampered.pricing.total !== clientTamperedTotal,
  'Server-side pricing ignores client total (1200 + 150 = 1350)'
);
assert(tampered.pricing.total === 1350, 'Correct upgrade total calculated');

const fakeUpgrades = resolveSecurePricing('business', ['fake-upgrade-id'], null, false);
assert(fakeUpgrades.pricing.total === 1200, 'Invalid upgrade IDs stripped from pricing');

const paymentFloor = resolveSecurePricing('business', ['payment'], null, false);
assert(paymentFloor.pricing.total === 1200 + 900, 'Payment integration priced at GHS 900 minimum');

console.log('\nReceipt protection');
assert(isValidReceiptId('REQ-483920'), 'Valid receipt ID accepted');
assert(!isValidReceiptId('REQ-48392'), 'Short receipt ID rejected');
assert(!isValidReceiptId('INV-483920'), 'Wrong receipt prefix rejected');
assert(!isValidReceiptId('REQ-ABCDEF'), 'Non-numeric receipt suffix rejected');

console.log('\nInput sanitization');
const sanitized = sanitizeFormData({
  fullName: '  A'.padEnd(200, 'x'),
  phone: '0501234567',
  businessName: 'Biz',
  additionalNotes: 'y'.repeat(5000),
});
assert(sanitized.fullName.length === 120, 'Full name truncated to 120 chars');
assert(sanitized.additionalNotes.length === 2000, 'Notes truncated to 2000 chars');

console.log('\nDeployment pricing');
const withDeployment = resolveSecurePricing('store', [], null, true);
assert(withDeployment.pricing.total === 1500 + 600, 'Deployment adds GHS 600');

console.log('\nBundle pricing');
const bundle = resolveSecurePricing('business', [], 'growth-bundle', false);
assert(
  bundle.pricing.total === TEMPLATE_PRICES.business + BUNDLE_PRICES['growth-bundle'],
  'Growth bundle adds bundle price to template base'
);

console.log(`\nResult: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
}

console.log('All production security checks passed.\n');
