/**
 * Offline, template-based copy drafting ("AI-assisted" helper without sending data anywhere).
 * Only uses facts the customer entered; never invents prices, awards or claims.
 */
const TYPE_COPY = {
  business: { lead: 'Trusted', noun: 'services', cta: ['Get a quote', 'Our services'] },
  ecommerce: { lead: 'Shop', noun: 'products', cta: ['Shop now', 'Browse products'] },
  portfolio: { lead: 'Selected work by', noun: 'projects', cta: ['View my work', 'Contact me'] },
  'personal-brand': { lead: 'Meet', noun: 'work', cta: ['Work with me', 'My story'] },
  landing: { lead: 'Introducing', noun: 'offer', cta: ['Get started', 'Learn more'] },
  blog: { lead: 'Stories and updates from', noun: 'articles', cta: ['Read the latest', 'Subscribe'] },
  booking: { lead: 'Book with', noun: 'appointments', cta: ['Book now', 'See services'] },
  educational: { lead: 'Learn with', noun: 'programmes', cta: ['Explore courses', 'Enrol today'] },
  membership: { lead: 'Join', noun: 'community', cta: ['Become a member', 'See benefits'] },
  'web-app': { lead: 'Work smarter with', noun: 'tools', cta: ['Get started', 'See how it works'] },
  other: { lead: 'Welcome to', noun: 'offerings', cta: ['Get in touch', 'Learn more'] },
};

const PURPOSE_PHRASES = {
  'get-customers': 'helping more customers find and choose us',
  'sell-online': 'making it easy to order online',
  'display-services': 'clearly presenting what we offer',
  showcase: 'showcasing our best work',
  bookings: 'letting you book in just a few taps',
  leads: 'making it simple to get in touch',
  publish: 'sharing news and helpful articles',
  community: 'bringing people together',
  automate: 'saving you time with simple online tools',
};

export function draftWebsiteCopy(state) {
  const name = state.text?.projectName?.trim() || 'Your Business';
  const typeCopy = TYPE_COPY[state.type] ?? TYPE_COPY.other;
  const firstOffering = (state.text?.offerings ?? '')
    .split('\n')
    .map((line) => line.split(/[-–:]/)[0].trim())
    .find(Boolean);
  const purposes = (state.purposes ?? []).map((id) => PURPOSE_PHRASES[id]).filter(Boolean).slice(0, 2);

  const headline = firstOffering ? `${typeCopy.lead} ${name} — ${firstOffering}` : `${typeCopy.lead} ${name}`;
  const focus = purposes.length ? ` We're focused on ${purposes.join(' and ')}.` : '';
  const goal = state.goalText?.trim() ? ` ${state.goalText.trim().replace(/^I want /i, 'We want ')}` : '';
  const description = `${name} offers quality ${typeCopy.noun} with friendly, reliable service.${focus}${goal}`.slice(0, 1000);

  return {
    headline: headline.slice(0, 200),
    description,
    ctaPrimary: typeCopy.cta[0],
    ctaSecondary: typeCopy.cta[1],
  };
}
