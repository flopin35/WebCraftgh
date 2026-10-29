/**
 * DEFAULT PRICE LIST (GH₵) — placeholder values.
 *
 * This is the fallback. The live price list is stored in Firestore (siteConfig/priceList)
 * and can be edited at /admin/pricing without touching code. Any key missing from the
 * Firestore copy falls back to the value here.
 *
 * All values are ESTIMATES. Final quotations are always set by WebCraft after review.
 */
export const DEFAULT_PRICE_LIST = {
  version: 1,
  currency: 'GHS',

  /** Base build price per website type. Includes the Home page and responsive layout. */
  baseByType: {
    landing: 700,
    portfolio: 900,
    'personal-brand': 900,
    business: 1000,
    blog: 1200,
    booking: 1400,
    educational: 1600,
    ecommerce: 1800,
    membership: 2400,
    'web-app': 4000,
    other: 1000,
  },

  /** Types that always need manual assessment before quoting. */
  manualReviewTypes: ['web-app', 'other'],

  /** Price per page (beyond Home). Complex pages cost more. */
  pages: {
    about: 150,
    services: 200,
    'service-details': 120, // per service
    products: 250,
    'product-details': 300, // product page template
    'cart-checkout': 400,
    portfolio: 250,
    gallery: 150,
    blog: 200,
    contact: 120,
    faq: 120,
    testimonials: 100,
    pricing: 150,
    booking: 200,
    auth: 300,
    'customer-dashboard': 600,
    'admin-dashboard': 400,
    legal: 150,
  },
  /** Price per additional custom page requested by the customer (simple / complex). */
  extraPage: { simple: 200, complex: 500 },

  features: {
    responsive: 0,
    'contact-form': 150,
    whatsapp: 50,
    'click-to-call': 0,
    'email-links': 0,
    'social-links': 0,
    'google-maps': 80,
    'photo-gallery': 200,
    'image-slider': 150,
    animations: 300,
    testimonials: 100,
    reviews: 450,
    'blog-cms': 700,
    search: 400,
    newsletter: 200,
    analytics: 100,
    'seo-basics': 300,
    'booking-system': 1200,
    'online-payments': 900,
    'shopping-cart': 700,
    inventory: 800,
    'customer-accounts': 1000,
    'admin-dashboard': 1400,
    'email-notifications': 250,
    'automated-notifications': 600,
    'security-backups': 300,
    'custom-functionality': 0, // always manual review
  },

  /** Features that are always flagged for manual review. */
  manualReviewFeatures: ['custom-functionality', 'automated-notifications'],

  /** Bundles: when every feature in `features` is selected, `discount` is subtracted once. */
  bundles: [
    {
      id: 'store-bundle',
      label: 'Online store bundle',
      features: ['online-payments', 'shopping-cart', 'inventory'],
      discount: 400,
    },
    {
      id: 'contact-bundle',
      label: 'Contact essentials bundle',
      features: ['contact-form', 'whatsapp', 'google-maps'],
      discount: 50,
    },
    {
      id: 'portal-bundle',
      label: 'Accounts + admin bundle',
      features: ['customer-accounts', 'admin-dashboard'],
      discount: 300,
    },
  ],

  /** Design-related costs. */
  design: {
    styleSurcharge: { luxury: 300, editorial: 250, bold: 150, tech: 150 },
    colorMode: { light: 0, dark: 0, both: 350 },
    customColors: 0,
    logoDesign: 800,
    brandGuidelinesHelp: 500,
  },

  /** Content / text services. */
  content: {
    copywritingPerPage: 120,
    aiDraftingReview: 0,
    extraLanguagePerLanguage: 600,
    assetSourcingFlat: 300,
    photoEditingPerImageBatch: 200,
  },

  /** E-commerce specifics. */
  ecommerce: {
    productCount: { '1-20': 0, '21-100': 400, '101-500': 1200, '500-plus': 0 },
    productCountManualReview: ['500-plus'],
    variations: 300,
    discountCodes: 250,
    deliveryRules: 350,
    orderTracking: 500,
    orderConfirmations: 150,
    digitalDelivery: 400,
    paymentMethod: {
      momo: 300,
      card: 200,
      paystack: 0,
      hubtel: 0,
      'bank-transfer': 0,
      'cash-on-delivery': 0,
      'other-gateway': 0,
    },
    paymentMethodManualReview: ['other-gateway'],
  },

  /** One-time setup services. */
  setup: {
    domainSetup: 100,
    hostingSetup: 150,
    sslSetup: 0,
  },

  /**
   * Recurring / third-party costs — shown SEPARATELY, never added to the development estimate.
   * These are typical market estimates and depend on the provider.
   */
  recurring: {
    domainComPerYear: 250,
    domainComGhPerYear: 450,
    hostingPerYear: { simple: 600, standard: 1200, ecommerce: 2000 },
    maintenancePerMonth: { none: 0, basic: 150, standard: 350 },
    paymentGatewayFeeNote: 'Payment gateways charge about 1.5–3% per transaction.',
    smsNote: 'SMS/WhatsApp notifications are billed per message by the provider.',
  },

  /** Lower-cost alternatives suggested when over budget. replaceWith = cheaper feature id (or null to remove). */
  alternatives: {
    'booking-system': { replaceWith: 'whatsapp', note: 'Take bookings through a WhatsApp button instead of a full booking system.' },
    'online-payments': { replaceWith: null, note: 'Share Mobile Money payment details on the site and confirm payments manually.' },
    'customer-accounts': { replaceWith: null, note: 'Skip customer logins for now — add them later as the business grows.' },
    'admin-dashboard': { replaceWith: null, note: 'Let WebCraft update content for you instead of building a dashboard.' },
    'blog-cms': { replaceWith: null, note: 'Use a simple news page that WebCraft updates instead of a full CMS.' },
    reviews: { replaceWith: 'testimonials', note: 'Show curated testimonials instead of open customer reviews.' },
    'automated-notifications': { replaceWith: 'email-notifications', note: 'Use email notifications instead of SMS/WhatsApp automation.' },
    search: { replaceWith: null, note: 'Clear navigation is usually enough for smaller sites.' },
    animations: { replaceWith: null, note: 'Use subtle default transitions instead of custom animations.' },
    inventory: { replaceWith: null, note: 'Track stock manually at first.' },
    'shopping-cart': { replaceWith: 'whatsapp', note: 'Let customers order via a WhatsApp button on each product.' },
  },

  /** Rounding for estimates (nearest N cedis) and the range shown around the estimate. */
  rounding: 50,
  rangePercent: 10,
};
