export const TEMPLATE_WIZARD_STEPS = [
  { id: 1, label: 'Type' },
  { id: 2, label: 'Package' },
  { id: 3, label: 'Features' },
  { id: 4, label: 'Recommend' },
  { id: 5, label: 'Contact' },
  { id: 6, label: 'Review' },
];

export const websiteTypes = [
  {
    id: 'business',
    label: 'Business Website',
    description: 'Professional sites for companies, shops, and service providers.',
  },
  {
    id: 'school',
    label: 'School Website',
    description: 'Showcase programs, admissions, news, and contact information.',
  },
  {
    id: 'foundation',
    label: 'Foundation Website',
    description: 'Share your mission, accept support, and build trust online.',
  },
  {
    id: 'church',
    label: 'Church Website',
    description: 'Connect your congregation with sermons, events, and giving.',
  },
  {
    id: 'portfolio',
    label: 'Portfolio Website',
    description: 'Showcase your work, skills, and personal brand beautifully.',
  },
  {
    id: 'political',
    label: 'Political Campaign Website',
    description: 'Reach voters with updates, events, and volunteer sign-ups.',
  },
];

export const templatePackages = [
  {
    id: 'business-starter',
    websiteTypeId: 'business',
    name: 'Business Starter',
    tier: 'basic',
    price: 1200,
    description: 'A clean, professional website to establish your business online.',
    features: ['5-page layout', 'Services & contact pages', 'Mobile responsive', 'WhatsApp button'],
    tag: 'Popular',
  },
  {
    id: 'business-pro',
    websiteTypeId: 'business',
    name: 'Business Pro',
    tier: 'pro',
    price: 1800,
    description: 'Everything in Starter plus room to grow with advanced sections.',
    features: ['Up to 8 pages', 'Testimonials section', 'News/blog ready', 'Priority support'],
    tag: 'Best Value',
  },
  {
    id: 'school-starter',
    websiteTypeId: 'school',
    name: 'School Basic',
    tier: 'basic',
    price: 1100,
    description: 'Essential pages for schools, academies, and training centers.',
    features: ['About & admissions', 'Programs overview', 'Contact & location', 'Mobile friendly'],
    tag: 'Affordable',
  },
  {
    id: 'school-pro',
    websiteTypeId: 'school',
    name: 'School Pro',
    tier: 'pro',
    price: 1500,
    description: 'Full school presence with news, gallery, and parent resources.',
    features: ['News & announcements', 'Photo gallery', 'Downloads section', 'Extended pages'],
    tag: 'Recommended',
  },
  {
    id: 'foundation-starter',
    websiteTypeId: 'foundation',
    name: 'Foundation Basic',
    tier: 'basic',
    price: 1100,
    description: 'Tell your story and make it easy for supporters to reach you.',
    features: ['Mission & about pages', 'Programs overview', 'Contact & donate CTA', 'Mobile responsive'],
    tag: 'Affordable',
  },
  {
    id: 'foundation-pro',
    websiteTypeId: 'foundation',
    name: 'Foundation Pro',
    tier: 'pro',
    price: 1400,
    description: 'Built for NGOs and foundations ready to grow their impact online.',
    features: ['Impact stories section', 'Events ready', 'News/blog ready', 'Donation-ready layout'],
    tag: 'Best For NGOs',
  },
  {
    id: 'church-starter',
    websiteTypeId: 'church',
    name: 'Church Basic',
    tier: 'basic',
    price: 1100,
    description: 'Welcome visitors with service times, beliefs, and contact info.',
    features: ['Service times', 'About & beliefs', 'Contact page', 'Mobile friendly'],
    tag: 'Affordable',
  },
  {
    id: 'church-pro',
    websiteTypeId: 'church',
    name: 'Church Pro',
    tier: 'pro',
    price: 1400,
    description: 'Engage your congregation with events, media, and online giving.',
    features: ['Events section', 'Sermons/media ready', 'Volunteer page', 'Giving-ready layout'],
    tag: 'Recommended',
  },
  {
    id: 'portfolio-starter',
    websiteTypeId: 'portfolio',
    name: 'Portfolio Basic',
    tier: 'basic',
    price: 900,
    description: 'A sleek showcase for freelancers and creatives.',
    features: ['Project gallery', 'About & contact', 'Mobile responsive', 'Social links'],
    tag: 'Starter',
  },
  {
    id: 'portfolio-pro',
    websiteTypeId: 'portfolio',
    name: 'Portfolio Pro',
    tier: 'pro',
    price: 1200,
    description: 'Stand out with testimonials, blog, and a polished personal brand.',
    features: ['Client testimonials', 'Blog section', 'Extended gallery', 'Resume/CV page'],
    tag: 'Best Value',
  },
  {
    id: 'political-starter',
    websiteTypeId: 'political',
    name: 'Campaign Basic',
    tier: 'basic',
    price: 1100,
    description: 'Launch your campaign with news, bio, and supporter contact.',
    features: ['Candidate bio', 'News & updates', 'Volunteer contact', 'Mobile responsive'],
    tag: 'Affordable',
  },
  {
    id: 'political-pro',
    websiteTypeId: 'political',
    name: 'Campaign Pro',
    tier: 'pro',
    price: 1500,
    description: 'Full campaign hub with events, media, and donation support.',
    features: ['Events calendar ready', 'Media gallery', 'Endorsements section', 'Donation-ready layout'],
    tag: 'Most Popular',
  },
];

export const upgradeCategories = [
  {
    id: 'growth',
    label: 'Growth Features',
    description: 'Reach more people and understand what works on your site.',
    featureIds: ['ai-assistant', 'blog', 'analytics'],
    websiteTypes: ['business', 'school', 'foundation', 'church', 'portfolio', 'political'],
  },
  {
    id: 'business',
    label: 'Business Features',
    description: 'Accept payments, bookings, and give customers their own login.',
    featureIds: ['payment', 'appointments', 'authentication'],
    websiteTypes: ['business', 'school', 'portfolio'],
  },
  {
    id: 'foundation',
    label: 'Foundation & Community Features',
    description: 'Perfect for churches, NGOs, and campaigns.',
    featureIds: ['donations', 'events'],
    websiteTypes: ['foundation', 'church', 'political'],
  },
];

export const friendlyUpgradeCopy = {
  'ai-assistant': {
    name: 'AI Assistant',
    description: 'Answer visitor questions instantly, even when you are offline.',
  },
  blog: {
    name: 'Blog & News Section',
    description: 'Share updates and articles without calling a developer.',
  },
  analytics: {
    name: 'Visitor Statistics & Reports',
    description: 'See how many people visit and what they click on most.',
  },
  payment: {
    name: 'Online Payments',
    description: 'Accept Mobile Money, cards, and bank payments securely.',
  },
  appointments: {
    name: 'Appointment Booking',
    description: 'Let customers book time with you without phone calls.',
  },
  authentication: {
    name: 'Customer Login Area',
    description: 'Give returning customers a secure account space.',
  },
  donations: {
    name: 'Donations',
    description: 'Make it easy for supporters to give online.',
  },
  events: {
    name: 'Events & Announcements',
    description: 'Share and manage upcoming events from your dashboard.',
  },
};

export const WEBSITE_TYPE_IDS = websiteTypes.map((t) => t.id);
export const PACKAGE_IDS = templatePackages.map((p) => p.id);

export function getWebsiteTypeById(id) {
  return websiteTypes.find((t) => t.id === id) ?? null;
}

export function getPackagesForWebsiteType(websiteTypeId) {
  return templatePackages.filter((p) => p.websiteTypeId === websiteTypeId);
}

export function getPackageById(id) {
  return templatePackages.find((p) => p.id === id) ?? null;
}

export function getCategoriesForWebsiteType(websiteTypeId) {
  return upgradeCategories.filter((c) => c.websiteTypes.includes(websiteTypeId));
}

export function labelForWebsiteType(id) {
  return getWebsiteTypeById(id)?.label ?? id;
}
