export const SITE_NAME = 'WebCraft GH';
export const SITE_DOMAIN = 'www.webcraftgh.com';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.webcraftgh.com';
export const SITE_TAGLINE = 'Professional websites built for Ghanaian businesses.';

export function getSiteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL.replace(/\/$/, '')}${normalizedPath}`;
}
