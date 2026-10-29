import { BUDGET_MAX, BUDGET_MIN, FEATURE_OPTIONS, PAGE_OPTIONS, WEBSITE_TYPES } from '../data/builder/builderOptions.js';
import { normalizeHex } from './colorContrast.js';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_PATTERN = /^[+0-9][0-9\s()-]{6,19}$/;
const URL_PATTERN = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i;

const trim = (value) => (typeof value === 'string' ? value.trim() : '');

export function validateBuilderStep(stepId, state) {
  const errors = [];

  switch (stepId) {
    case 'budget': {
      const amount = Number(state.budget?.amount);
      if (!Number.isFinite(amount) || amount < BUDGET_MIN || amount > BUDGET_MAX) {
        errors.push(`Choose a budget between GH₵${BUDGET_MIN.toLocaleString()} and GH₵${BUDGET_MAX.toLocaleString()}, or request a custom estimate.`);
      }
      break;
    }
    case 'type':
      if (!WEBSITE_TYPES.some((type) => type.id === state.type)) errors.push('Choose a website type.');
      if (!(state.purposes ?? []).length && !trim(state.goalText)) errors.push('Pick at least one goal or describe your main goal.');
      break;
    case 'pages':
      if (!(state.pages ?? []).includes('home')) errors.push('The Home page is required.');
      if ((state.pages ?? []).some((id) => !PAGE_OPTIONS.some((page) => page.id === id))) errors.push('Unknown page selected.');
      break;
    case 'branding':
      for (const key of ['primary', 'secondary', 'accent']) {
        if (!normalizeHex(state.branding?.[key])) errors.push(`Enter a valid ${key} colour (e.g. #2563eb).`);
      }
      break;
    case 'style':
      for (const ref of state.style?.references ?? []) {
        if (trim(ref.url) && !URL_PATTERN.test(trim(ref.url))) errors.push(`"${ref.url}" does not look like a website address.`);
      }
      break;
    case 'text':
      if (!trim(state.text?.projectName)) errors.push('Enter your business or project name.');
      break;
    case 'features':
      if ((state.features ?? []).some((id) => !FEATURE_OPTIONS.some((feature) => feature.id === id))) errors.push('Unknown feature selected.');
      break;
    case 'ecommerce':
      if (!(state.ecommerce?.sellTypes ?? []).length) errors.push('Tell us what you will sell.');
      if (!state.ecommerce?.productCount) errors.push('Choose an estimated number of products.');
      if (!(state.ecommerce?.paymentMethods ?? []).length) errors.push('Choose at least one payment method.');
      break;
    case 'content':
      if (!state.content?.responsibility) errors.push('Tell us who will provide and approve the content.');
      break;
    case 'domain':
      if (!state.domain?.ownsDomain) errors.push('Tell us whether you already own a domain.');
      if (state.domain?.ownsDomain === 'yes' && !trim(state.domain?.domainName)) errors.push('Enter your existing domain name.');
      if (!state.domain?.hosting) errors.push('Tell us whether you need hosting.');
      break;
    case 'summary':
      if (!state.summaryConfirmed) errors.push('Please confirm that the summary is accurate.');
      break;
    case 'details': {
      const c = state.customer ?? {};
      if (!trim(c.fullName)) errors.push('Enter your name.');
      if (!EMAIL_PATTERN.test(trim(c.email))) errors.push('Enter a valid email address.');
      if ((c.contactMethod === 'phone' || c.contactMethod === 'whatsapp') && !PHONE_PATTERN.test(trim(c.phone))) {
        errors.push('Enter a phone number so we can reach you on your preferred method.');
      }
      if (trim(c.phone) && !PHONE_PATTERN.test(trim(c.phone))) errors.push('Phone number looks invalid.');
      if (!c.consent) errors.push('Please agree to the privacy notice so we can use your details to prepare a quotation.');
      break;
    }
    default:
      break;
  }

  return { isValid: errors.length === 0, errors: [...new Set(errors)] };
}

export function validateCustomEstimate(data) {
  const errors = [];
  if (trim(data.description).length < 20) errors.push('Describe your project in at least a few sentences (20+ characters).');
  if (!trim(data.fullName)) errors.push('Enter your name.');
  if (!EMAIL_PATTERN.test(trim(data.email))) errors.push('Enter a valid email address.');
  if (trim(data.phone) && !PHONE_PATTERN.test(trim(data.phone))) errors.push('Phone number looks invalid.');
  if (data.contactMethod !== 'email' && !trim(data.phone)) errors.push('Enter a phone number for WhatsApp or phone contact.');
  if (!data.consent) errors.push('Please agree to the privacy notice.');
  return { isValid: errors.length === 0, errors };
}
