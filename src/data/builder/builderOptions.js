/**
 * Static option lists for the WebCraft website builder.
 * Prices are NOT defined here — see defaultPriceList.js (editable in /admin/pricing).
 */

export const BUILDER_COLLECTION = 'websiteBuilderRequests';
export const BUILDER_STATUS_COLLECTION = 'builderRequestStatus';
export const BUILDER_REPLY_COLLECTION = 'builderCustomerReplies';
export const BUILDER_STORAGE_PATH = 'websiteBuilderRequests';
export const PRICE_LIST_DOC = { collection: 'siteConfig', id: 'priceList' };

export const BUDGET_MIN = 1000;
export const BUDGET_MAX = 10000;
export const BUDGET_STEP = 100;

export const BUDGET_TIERS = [
  {
    id: 'tier-1',
    min: 1000,
    max: 1900,
    label: 'GH₵1,000 – 1,900',
    suitableFor: 'A landing page or a simple 1–4 page site for a small business, event or personal brand.',
  },
  {
    id: 'tier-2',
    min: 2000,
    max: 3500,
    label: 'GH₵2,000 – 3,500',
    suitableFor: 'A full business, portfolio or blog website with 5–8 pages and common features like galleries and maps.',
  },
  {
    id: 'tier-3',
    min: 3600,
    max: 6000,
    label: 'GH₵3,600 – 6,000',
    suitableFor: 'Booking sites, small online stores, or larger sites with a content dashboard and integrations.',
  },
  {
    id: 'tier-4',
    min: 6100,
    max: 10000,
    label: 'GH₵6,100 – 10,000',
    suitableFor: 'Full online stores, membership or educational platforms with accounts, payments and automation.',
  },
];

export function getTierForAmount(amount) {
  return BUDGET_TIERS.find((tier) => amount >= tier.min && amount <= tier.max) ?? null;
}

export const WEBSITE_TYPES = [
  { id: 'business', label: 'Business website', icon: '🏢' },
  { id: 'ecommerce', label: 'E-commerce / online store', icon: '🛒' },
  { id: 'portfolio', label: 'Portfolio website', icon: '🎨' },
  { id: 'personal-brand', label: 'Personal brand website', icon: '👤' },
  { id: 'landing', label: 'Landing page', icon: '🚀' },
  { id: 'blog', label: 'Blog or news website', icon: '📰' },
  { id: 'booking', label: 'Booking / appointment website', icon: '📅' },
  { id: 'educational', label: 'Educational website', icon: '🎓' },
  { id: 'membership', label: 'Membership website', icon: '🔑' },
  { id: 'web-app', label: 'Web application', icon: '⚙️' },
  { id: 'other', label: 'Other / custom project', icon: '✨' },
];

export const WEBSITE_PURPOSES = [
  { id: 'get-customers', label: 'Get more customers' },
  { id: 'sell-online', label: 'Sell products online' },
  { id: 'display-services', label: 'Display services' },
  { id: 'showcase', label: 'Showcase projects or a portfolio' },
  { id: 'bookings', label: 'Accept bookings or appointments' },
  { id: 'leads', label: 'Collect enquiries and leads' },
  { id: 'publish', label: 'Publish articles or news' },
  { id: 'community', label: 'Build a community or membership' },
  { id: 'automate', label: 'Automate a business process' },
];

/** Pages. `requires` lists features that the page depends on (auto-added by the pricing engine). */
export const PAGE_OPTIONS = [
  { id: 'home', label: 'Home', locked: true },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'service-details', label: 'Individual service detail pages', perItem: true, itemLabel: 'services' },
  { id: 'products', label: 'Products' },
  { id: 'product-details', label: 'Individual product pages', requires: [] },
  { id: 'cart-checkout', label: 'Shopping cart & checkout', requires: ['shopping-cart', 'online-payments'] },
  { id: 'portfolio', label: 'Portfolio / projects' },
  { id: 'gallery', label: 'Gallery', requires: ['photo-gallery'] },
  { id: 'blog', label: 'Blog / news', requires: ['blog-cms'] },
  { id: 'contact', label: 'Contact', requires: ['contact-form'] },
  { id: 'faq', label: 'FAQ' },
  { id: 'testimonials', label: 'Testimonials / reviews section', requires: ['testimonials'] },
  { id: 'pricing', label: 'Pricing' },
  { id: 'booking', label: 'Booking', requires: ['booking-system'] },
  { id: 'auth', label: 'Login & registration', requires: ['customer-accounts'] },
  { id: 'customer-dashboard', label: 'Customer dashboard', requires: ['customer-accounts'] },
  { id: 'admin-dashboard', label: 'Admin dashboard', requires: ['admin-dashboard'] },
  { id: 'legal', label: 'Privacy policy & terms' },
];

/** Suggested pages per website type (pre-selected when the type is chosen). */
export const TYPE_PAGE_SUGGESTIONS = {
  business: ['home', 'about', 'services', 'contact', 'testimonials'],
  ecommerce: ['home', 'about', 'products', 'product-details', 'cart-checkout', 'contact', 'legal'],
  portfolio: ['home', 'about', 'portfolio', 'contact'],
  'personal-brand': ['home', 'about', 'services', 'contact'],
  landing: ['home'],
  blog: ['home', 'about', 'blog', 'contact'],
  booking: ['home', 'about', 'services', 'booking', 'contact'],
  educational: ['home', 'about', 'services', 'blog', 'faq', 'contact'],
  membership: ['home', 'about', 'pricing', 'auth', 'customer-dashboard', 'contact', 'legal'],
  'web-app': ['home', 'auth', 'customer-dashboard', 'admin-dashboard', 'legal'],
  other: ['home', 'contact'],
};

export const COLOR_THEMES = [
  { id: 'blue-white', label: 'Blue & white', primary: '#2563eb', secondary: '#ffffff', accent: '#f59e0b' },
  { id: 'black-gold', label: 'Black & gold', primary: '#111111', secondary: '#faf7ef', accent: '#c9a227' },
  { id: 'green-white', label: 'Green & white', primary: '#15803d', secondary: '#ffffff', accent: '#facc15' },
  { id: 'purple-white', label: 'Purple & white', primary: '#7c3aed', secondary: '#ffffff', accent: '#ec4899' },
  { id: 'black-white', label: 'Black & white', primary: '#111827', secondary: '#ffffff', accent: '#6b7280' },
  { id: 'orange-charcoal', label: 'Orange & charcoal', primary: '#ea580c', secondary: '#1f2937', accent: '#fbbf24' },
  { id: 'red-white', label: 'Red & white', primary: '#dc2626', secondary: '#ffffff', accent: '#1e3a8a' },
  { id: 'custom', label: 'Custom colours', primary: '#0f766e', secondary: '#ffffff', accent: '#f97316' },
];

export const VISUAL_STYLES = [
  { id: 'modern', label: 'Modern & clean', radius: 12, weight: 700, spacing: 1 },
  { id: 'minimal', label: 'Minimalist', radius: 2, weight: 500, spacing: 1.25 },
  { id: 'luxury', label: 'Luxury & premium', radius: 0, weight: 400, spacing: 1.3 },
  { id: 'corporate', label: 'Corporate & professional', radius: 6, weight: 700, spacing: 1 },
  { id: 'bold', label: 'Bold & creative', radius: 20, weight: 800, spacing: 0.9 },
  { id: 'elegant', label: 'Elegant', radius: 4, weight: 400, spacing: 1.2 },
  { id: 'playful', label: 'Playful', radius: 24, weight: 700, spacing: 1 },
  { id: 'tech', label: 'Technology-inspired', radius: 8, weight: 600, spacing: 1 },
  { id: 'editorial', label: 'Editorial / magazine', radius: 0, weight: 700, spacing: 1.1 },
];

export const COLOR_MODES = [
  { id: 'light', label: 'Light mode' },
  { id: 'dark', label: 'Dark mode' },
  { id: 'both', label: 'Both (visitor can switch)' },
];

/** Approved font pairings (all Google Fonts). */
export const FONT_PAIRINGS = [
  { id: 'inter', label: 'Inter + Inter', category: 'sans-serif', heading: 'Inter', body: 'Inter' },
  { id: 'poppins', label: 'Poppins + Open Sans', category: 'sans-serif', heading: 'Poppins', body: 'Open Sans' },
  { id: 'montserrat', label: 'Montserrat + Source Sans 3', category: 'sans-serif', heading: 'Montserrat', body: 'Source Sans 3' },
  { id: 'playfair', label: 'Playfair Display + Lato', category: 'serif', heading: 'Playfair Display', body: 'Lato' },
  { id: 'merriweather', label: 'Merriweather + Roboto', category: 'serif', heading: 'Merriweather', body: 'Roboto' },
  { id: 'dm-serif', label: 'DM Serif Display + DM Sans', category: 'serif', heading: 'DM Serif Display', body: 'DM Sans' },
  { id: 'space-grotesk', label: 'Space Grotesk + Inter', category: 'display', heading: 'Space Grotesk', body: 'Inter' },
  { id: 'nunito', label: 'Nunito + Nunito Sans', category: 'rounded', heading: 'Nunito', body: 'Nunito Sans' },
];

export const TYPOGRAPHY_STYLES = [
  { id: 'all', label: 'Show all' },
  { id: 'sans-serif', label: 'Clean sans-serif' },
  { id: 'serif', label: 'Classic serif' },
  { id: 'display', label: 'Techy display' },
  { id: 'rounded', label: 'Friendly rounded' },
];

export const LANGUAGE_OPTIONS = [
  { id: 'en', label: 'English' },
  { id: 'tw', label: 'Twi' },
  { id: 'ga', label: 'Ga' },
  { id: 'ee', label: 'Ewe' },
  { id: 'ha', label: 'Hausa' },
  { id: 'fr', label: 'French' },
];

/** Features. `group` is used for display only. */
export const FEATURE_OPTIONS = [
  { id: 'responsive', label: 'Mobile-responsive layout', group: 'Essentials', locked: true },
  { id: 'contact-form', label: 'Contact forms', group: 'Contact' },
  { id: 'whatsapp', label: 'WhatsApp contact button', group: 'Contact' },
  { id: 'click-to-call', label: 'Click-to-call button', group: 'Contact' },
  { id: 'email-links', label: 'Email contact links', group: 'Contact' },
  { id: 'social-links', label: 'Social media links', group: 'Contact' },
  { id: 'google-maps', label: 'Google Maps integration', group: 'Contact' },
  { id: 'photo-gallery', label: 'Photo gallery', group: 'Content & design' },
  { id: 'image-slider', label: 'Image sliders', group: 'Content & design' },
  { id: 'animations', label: 'Animations & transitions', group: 'Content & design' },
  { id: 'testimonials', label: 'Testimonials', group: 'Content & design' },
  { id: 'reviews', label: 'Customer reviews (visitors can submit)', group: 'Content & design' },
  { id: 'blog-cms', label: 'Blog & content management', group: 'Content & design' },
  { id: 'search', label: 'Search functionality', group: 'Content & design' },
  { id: 'newsletter', label: 'Newsletter signup', group: 'Marketing' },
  { id: 'analytics', label: 'Analytics integration', group: 'Marketing' },
  { id: 'seo-basics', label: 'Search-engine optimization basics', group: 'Marketing' },
  { id: 'booking-system', label: 'Booking system', group: 'Business tools' },
  { id: 'online-payments', label: 'Online payments', group: 'Business tools' },
  { id: 'shopping-cart', label: 'Shopping cart', group: 'Business tools' },
  { id: 'inventory', label: 'Product inventory management', group: 'Business tools' },
  { id: 'customer-accounts', label: 'Customer accounts', group: 'Business tools' },
  { id: 'admin-dashboard', label: 'Admin dashboard', group: 'Business tools' },
  { id: 'email-notifications', label: 'Email notifications', group: 'Automation' },
  { id: 'automated-notifications', label: 'Automated customer notifications (SMS/WhatsApp)', group: 'Automation' },
  { id: 'security-backups', label: 'Security hardening & backups', group: 'Automation' },
  { id: 'custom-functionality', label: 'Additional custom functionality', group: 'Automation' },
];

export const ECOMMERCE_SELL_TYPES = [
  { id: 'physical', label: 'Physical products' },
  { id: 'digital', label: 'Digital products' },
  { id: 'services', label: 'Services' },
];

export const PRODUCT_COUNT_OPTIONS = [
  { id: '1-20', label: '1 – 20 products' },
  { id: '21-100', label: '21 – 100 products' },
  { id: '101-500', label: '101 – 500 products' },
  { id: '500-plus', label: 'More than 500' },
];

export const PAYMENT_METHODS = [
  { id: 'momo', label: 'Mobile Money (MTN, Telecel, AirtelTigo)' },
  { id: 'card', label: 'Visa / Mastercard' },
  { id: 'paystack', label: 'Paystack gateway' },
  { id: 'hubtel', label: 'Hubtel gateway' },
  { id: 'bank-transfer', label: 'Bank transfer (manual confirmation)' },
  { id: 'cash-on-delivery', label: 'Cash on delivery' },
  { id: 'other-gateway', label: 'Other / international gateway (manual review)' },
];

export const YES_NO_UNSURE = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unsure', label: 'Not sure' },
];

export const CONTENT_STATUS = [
  { id: 'ready', label: 'Yes, ready' },
  { id: 'partial', label: 'Some of it' },
  { id: 'none', label: 'No' },
];

export const CONTENT_RESPONSIBILITY = [
  { id: 'customer', label: 'I will provide and approve all content' },
  { id: 'shared', label: 'I provide some, WebCraft fills the gaps for my approval' },
  { id: 'webcraft', label: 'WebCraft prepares everything for my approval' },
];

export const HOSTING_OPTIONS = [
  { id: 'webcraft', label: 'Yes — WebCraft should host it' },
  { id: 'own', label: 'No — I have my own hosting' },
  { id: 'unsure', label: 'Not sure, advise me' },
];

export const MAINTENANCE_OPTIONS = [
  { id: 'none', label: 'No maintenance plan' },
  { id: 'basic', label: 'Basic (updates, backups, uptime checks)' },
  { id: 'standard', label: 'Standard (basic + monthly content edits)' },
];

export const CONTACT_METHODS = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'phone', label: 'Phone call' },
  { id: 'email', label: 'Email' },
];

export const TIMELINE_OPTIONS = [
  { id: 'asap', label: 'As soon as possible' },
  { id: '2-weeks', label: 'Within 2 weeks' },
  { id: '1-month', label: 'Within 1 month' },
  { id: '3-months', label: 'Within 3 months' },
  { id: 'flexible', label: 'Flexible' },
];

export const BUILDER_UPLOADS = {
  logo: { label: 'Logo', accept: 'image/png,image/jpeg,image/webp,image/svg+xml', maxFiles: 1, maxSizeMb: 5 },
  brand: { label: 'Brand / product images', accept: 'image/png,image/jpeg,image/webp', maxFiles: 8, maxSizeMb: 5 },
  documents: { label: 'Reference documents', accept: 'application/pdf,image/png,image/jpeg', maxFiles: 5, maxSizeMb: 10 },
};

export const BUILDER_STATUSES = [
  'Pending Review',
  'Needs Information',
  'Reviewing',
  'Quotation Sent',
  'Quote Accepted',
  'Quote Declined',
  'In Development',
  'Completed',
  'Cancelled',
];

export const BUILDER_STEPS = [
  { id: 'budget', label: 'Budget' },
  { id: 'type', label: 'Type & goal' },
  { id: 'pages', label: 'Pages' },
  { id: 'branding', label: 'Colours & brand' },
  { id: 'style', label: 'Style & fonts' },
  { id: 'text', label: 'Text' },
  { id: 'features', label: 'Features' },
  { id: 'ecommerce', label: 'Store setup', conditional: true },
  { id: 'content', label: 'Content & assets' },
  { id: 'domain', label: 'Domain & hosting' },
  { id: 'summary', label: 'Summary' },
  { id: 'details', label: 'Your details' },
];

export const labelOf = (list, id) => list.find((item) => item.id === id)?.label ?? id;
