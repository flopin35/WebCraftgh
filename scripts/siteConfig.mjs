export const SITE_NAME = 'WebCraft GH';
export const SITE_DOMAIN = 'www.webcraftgh.com';
export const DEFAULT_SITE_URL = 'https://www.webcraftgh.com';

export function getSiteUrlFromEnv(env = process.env) {
  return (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
}
