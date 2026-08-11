/**
 * Public legal URLs for Play Store / App Store and in-app links.
 * Hosted on the production marketing site.
 */
export const LEGAL_SITE_ORIGIN = 'https://cholbepharmacy.com';

export const LEGAL_URLS = {
  home: LEGAL_SITE_ORIGIN,
  privacy: `${LEGAL_SITE_ORIGIN}/privacy`,
  terms: `${LEGAL_SITE_ORIGIN}/terms`,
  deleteAccount: `${LEGAL_SITE_ORIGIN}/delete-account`,
} as const;
