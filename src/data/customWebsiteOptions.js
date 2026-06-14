export const CUSTOM_REQUEST_COLLECTION = 'customWebsiteRequests';
export const CUSTOM_STORAGE_PATH = 'customWebsiteRequests';
export const CUSTOM_ESTIMATED_PRICE = 'GHS 2,000+';

export const businessTypes = [
  { id: 'business', label: 'Business' },
  { id: 'foundation', label: 'Foundation' },
  { id: 'politician', label: 'Politician' },
  { id: 'school', label: 'School' },
  { id: 'church', label: 'Church' },
  { id: 'ngo', label: 'NGO' },
  { id: 'e-commerce', label: 'E-Commerce' },
  { id: 'real-estate', label: 'Real Estate' },
  { id: 'job-platform', label: 'Job Platform' },
  { id: 'other', label: 'Other' },
];

export const pageOptions = [
  { id: 'home', label: 'Home Page' },
  { id: 'about', label: 'About Page' },
  { id: 'services', label: 'Services Page' },
  { id: 'contact', label: 'Contact Page' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'blog', label: 'Blog' },
  { id: 'news', label: 'News' },
  { id: 'store', label: 'Store' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'authentication', label: 'Authentication/Login' },
  { id: 'custom-page', label: 'Custom Page' },
  { id: 'other', label: 'Other' },
];

export const featureOptions = [
  { id: 'admin-dashboard', label: 'Admin Dashboard' },
  { id: 'ai-assistant', label: 'AI Assistant' },
  { id: 'payment', label: 'Payment Integration' },
  { id: 'donations', label: 'Donations System' },
  { id: 'booking', label: 'Booking System' },
  { id: 'blog', label: 'Blog System' },
  { id: 'analytics', label: 'Analytics Dashboard' },
  { id: 'user-accounts', label: 'User Accounts' },
  { id: 'multi-language', label: 'Multi-Language Support' },
  { id: 'custom-features', label: 'Custom Features' },
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
    label: 'Reference Images',
    accept: 'image/png,image/jpeg,image/webp',
    multiple: true,
    maxFiles: 5,
    maxSizeMb: 5,
  },
  document: {
    label: 'Documents',
    accept: 'application/pdf,image/png,image/jpeg',
    multiple: true,
    maxFiles: 3,
    maxSizeMb: 10,
  },
};

export const BUSINESS_TYPE_IDS = businessTypes.map((item) => item.id);
