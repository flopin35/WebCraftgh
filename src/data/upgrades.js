export const DEPLOYMENT_PRICE = 600;

export const PAYMENT_INTEGRATION_MIN_PRICE = 900;
export const PAYMENT_BUNDLE_MIN_PRICE = 1200;

export const freeFeatures = [
  'Mobile Responsive Design',
  'Contact Form',
  'WhatsApp Button',
  'Social Media Integration',
  'Basic SEO',
  'Google Maps Integration',
  'Basic Security',
  'Modern UI Design',
  'Fast Loading Optimization',
  'One Round Of Revisions',
];

export const paidUpgrades = [
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    description: 'Provide visitors with instant answers and guidance.',
    price: 250,
  },
  {
    id: 'content-creation',
    name: 'Content Creation',
    description: 'We create your About Us, Services, Mission, and homepage content.',
    price: 200,
  },
  {
    id: 'blog',
    name: 'Blog / News System',
    description: 'Publish articles and updates without developer assistance.',
    price: 150,
  },
  {
    id: 'events',
    name: 'Event Management System',
    description: 'Create and manage events directly from your dashboard.',
    price: 200,
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Track visitors, engagement, and website performance.',
    price: 200,
  },
  {
    id: 'donations',
    name: 'Donations System',
    description:
      'Accept support and donations for foundations, churches, NGOs, and campaigns.',
    price: 250,
  },
  {
    id: 'appointments',
    name: 'Appointment Booking System',
    description: 'Allow customers to schedule appointments automatically.',
    price: 250,
  },
  {
    id: 'multi-language',
    name: 'Multi-Language Website',
    description: 'Display website content in multiple languages.',
    price: 300,
  },
  {
    id: 'authentication',
    name: 'Authentication / Login System',
    description: 'Allow users to create accounts and log in securely.',
    price: 300,
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'Manage content without developer assistance.',
    price: 350,
  },
  {
    id: 'payment',
    name: 'Payment Integration',
    description: 'Accept online payments securely.',
    price: PAYMENT_INTEGRATION_MIN_PRICE,
    includes: [
      'Payment Gateway Integration',
      'Success Page',
      'Failed Payment Page',
      'Payment Testing',
    ],
  },
];

export const premiumBundles = [
  {
    id: 'growth-bundle',
    name: 'Growth Bundle',
    price: 699,
    badge: 'Save GHS 201',
    includes: ['admin-dashboard', 'analytics', 'blog', 'events'],
  },
  {
    id: 'business-pro-bundle',
    name: 'Business Pro Bundle',
    price: 1299,
    badge: 'Most Popular',
    includes: ['payment', 'admin-dashboard', 'analytics'],
    minPrice: PAYMENT_BUNDLE_MIN_PRICE,
  },
  {
    id: 'foundation-pro-bundle',
    name: 'Foundation Pro Bundle',
    price: 899,
    badge: 'Best For Foundations',
    includes: ['donations', 'admin-dashboard', 'blog', 'events'],
  },
];

export const deploymentService = {
  name: 'Professional Deployment & Setup',
  price: DEPLOYMENT_PRICE,
  description: 'We deploy your website, connect your domain, and handle technical setup.',
  includes: [
    'Hosting Setup',
    'Domain Connection',
    'Deployment Assistance',
    'Technical Configuration',
  ],
};

export const trustPoints = [
  'Transparent Pricing',
  'No Hidden Fees',
  '24-Hour Free Bug Fix Guarantee',
  'Professional Development Process',
  'Receipt Generated For Every Project',
];

export const bugFixGuarantee = {
  title: '24-Hour Free Bug Fix Guarantee',
  message:
    'You have 24 hours after delivery to report bugs, broken functionality, display issues, or technical problems for free correction.',
  note: 'This applies only to bugs. New features and redesign requests are billed separately.',
};

export function getUpgradeById(id) {
  return paidUpgrades.find((upgrade) => upgrade.id === id) ?? null;
}

export function getBundleById(id) {
  return premiumBundles.find((bundle) => bundle.id === id) ?? null;
}

export function getBundleIndividualTotal(bundle) {
  return bundle.includes.reduce((total, upgradeId) => {
    return total + (getUpgradeById(upgradeId)?.price ?? 0);
  }, 0);
}

export function getBundleSavings(bundle) {
  return Math.max(0, getBundleIndividualTotal(bundle) - bundle.price);
}

// Backward compatibility for legacy imports
export const optionalFeatures = paidUpgrades;
export const PROFESSIONAL_DEPLOYMENT_COST = DEPLOYMENT_PRICE;
