export const CUSTOM_REQUEST_COLLECTION = 'customWebsiteRequests';
export const CUSTOM_STORAGE_PATH = 'customWebsiteRequests';

export const WIZARD_STEPS = [
  { id: 1, label: 'Business' },
  { id: 2, label: 'Goals' },
  { id: 3, label: 'Features' },
  { id: 4, label: 'Details' },
  { id: 5, label: 'Budget' },
  { id: 6, label: 'Review' },
];

export const businessTypes = [
  { id: 'business', label: 'Business' },
  { id: 'school', label: 'School' },
  { id: 'foundation-ngo', label: 'Foundation / NGO' },
  { id: 'church', label: 'Church' },
  { id: 'political-campaign', label: 'Political Campaign' },
  { id: 'personal-portfolio', label: 'Personal Portfolio' },
  { id: 'other', label: 'Other' },
];

export const websiteGoalOptions = [
  {
    id: 'get-customers',
    label: 'Get More Customers',
    description: 'Turn visitors into paying clients or enquiries.',
  },
  {
    id: 'online-payments',
    label: 'Accept Online Payments',
    description: 'Sell products or services and get paid online.',
  },
  {
    id: 'donations',
    label: 'Receive Donations',
    description: 'Make it easy for supporters to give online.',
  },
  {
    id: 'appointments',
    label: 'Book Appointments',
    description: 'Let people schedule visits, calls, or services.',
  },
  {
    id: 'showcase',
    label: 'Showcase Information',
    description: 'Share services, programs, or updates clearly.',
  },
  {
    id: 'brand-awareness',
    label: 'Build Brand Awareness',
    description: 'Look professional and build trust online.',
  },
  { id: 'other', label: 'Other', description: 'Tell us your goal in your own words.' },
];

export const featureOptions = [
  {
    id: 'payment',
    label: 'Online Payments',
    description: 'Accept Mobile Money, cards, or bank payments on your site.',
  },
  {
    id: 'booking',
    label: 'Appointment Booking',
    description: 'Let customers pick dates and times without phone calls.',
  },
  {
    id: 'donations',
    label: 'Donations',
    description: 'Collect one-time or recurring donations securely.',
  },
  {
    id: 'user-accounts',
    label: 'Customer Login Area',
    description: 'Give returning customers their own secure account space.',
  },
  {
    id: 'blog',
    label: 'Blog & News Section',
    description: 'Publish updates, articles, and announcements easily.',
  },
  {
    id: 'multi-language',
    label: 'Multi-Language Support',
    description: 'Reach more people in English, Twi, or other languages.',
  },
  {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    description: 'Manage content, orders, or enquiries from one place.',
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    description: 'Answer common questions automatically, 24/7.',
  },
  {
    id: 'analytics',
    label: 'Visitor Statistics & Reports',
    description: 'See how many people visit and what they engage with.',
  },
];

export const readinessOptions = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unsure', label: 'Not sure yet' },
];

export const contentReadinessOptions = [
  { id: 'yes', label: 'Yes, ready to go' },
  { id: 'partial', label: 'Some content ready' },
  { id: 'no', label: 'No, I need help' },
];

export const budgetOptions = [
  { id: 'under-1000', label: 'Under GHS 1,000' },
  { id: '1000-3000', label: 'GHS 1,000 – GHS 3,000' },
  { id: '3000-5000', label: 'GHS 3,000 – GHS 5,000' },
  { id: '5000-plus', label: 'GHS 5,000+' },
];

export const timelineOptions = [
  { id: 'asap', label: 'ASAP' },
  { id: '1-month', label: 'Within 1 Month' },
  { id: '3-months', label: 'Within 3 Months' },
  { id: 'flexible', label: 'Flexible' },
];

export const ALLOWED_UPLOAD_TYPES = {
  logo: {
    label: 'Logo',
    accept: 'image/png,image/jpeg,image/webp,image/svg+xml',
    multiple: false,
    maxFiles: 1,
    maxSizeMb: 5,
  },
  reference: {
    label: 'Website Inspiration',
    accept: 'image/png,image/jpeg,image/webp',
    multiple: true,
    maxFiles: 5,
    maxSizeMb: 5,
  },
};

export const BUSINESS_TYPE_IDS = businessTypes.map((item) => item.id);
export const WEBSITE_GOAL_IDS = websiteGoalOptions.map((item) => item.id);
export const FEATURE_IDS = featureOptions.map((item) => item.id);
export const BUDGET_IDS = budgetOptions.map((item) => item.id);
export const TIMELINE_IDS = timelineOptions.map((item) => item.id);

export function labelForOption(options, id) {
  return options.find((item) => item.id === id)?.label ?? id;
}
