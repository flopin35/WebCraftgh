import { COLOR_THEMES } from './builderOptions.js';

export const BUILDER_DRAFT_VERSION = 1;

export function createInitialBuilderState() {
  const theme = COLOR_THEMES[0];
  return {
    draftVersion: BUILDER_DRAFT_VERSION,
    stepId: 'budget',
    budget: { amount: 3000 },
    type: '',
    purposes: [],
    goalText: '',
    pages: ['home'],
    serviceCount: 3,
    extraPages: [],
    branding: {
      themeId: theme.id,
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      hasGuidelines: '',
      guidelinesNotes: '',
      wantsGuidelinesHelp: false,
      wantsLogoDesign: false,
    },
    style: {
      styleId: 'modern',
      colorMode: 'light',
      typographyStyle: 'all',
      fontId: 'inter',
      references: [{ url: '', likes: '' }],
    },
    text: {
      projectName: '',
      headline: '',
      description: '',
      ctaPrimary: 'Get in touch',
      ctaSecondary: 'Learn more',
      offerings: '',
      existingText: '',
      existingSiteUrl: '',
      copywritingHelp: false,
      languages: ['en'],
      brandTerms: '',
    },
    features: ['responsive', 'contact-form', 'whatsapp', 'click-to-call', 'email-links', 'social-links'],
    ecommerce: {
      sellTypes: [],
      productCount: '',
      variations: '',
      inventory: '',
      discountCodes: '',
      paymentMethods: [],
      deliveryRules: '',
      orderTracking: '',
      orderConfirmations: '',
      advancedNotes: '',
    },
    content: {
      hasText: '',
      hasLogo: '',
      hasProductPhotos: '',
      hasBusinessPhotos: '',
      wantsAssetSourcing: false,
      responsibility: '',
      notes: '',
    },
    domain: {
      ownsDomain: '',
      domainName: '',
      wantsDomainHelp: false,
      domainIdeas: '',
      hosting: '',
      maintenance: 'none',
    },
    overBudgetAcknowledged: false,
    summaryConfirmed: false,
    customer: {
      fullName: '',
      businessName: '',
      email: '',
      phone: '',
      contactMethod: 'whatsapp',
      timeline: '',
      consent: false,
    },
  };
}

export function createInitialEstimateState() {
  return {
    description: '',
    functionality: '',
    budgetRange: '',
    completionDate: '',
    fullName: '',
    businessName: '',
    email: '',
    phone: '',
    contactMethod: 'whatsapp',
    consent: false,
  };
}
