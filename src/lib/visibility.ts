/**
 * Site visibility. Read on the server only.
 *
 *   PUBLIC              indexable, no gate
 *   UNLISTED            noindex, no gate — the link is the key
 *   PRIVATE             noindex, no gate, stricter headers (default)
 *   PASSWORD_PROTECTED  noindex, access code required (see src/proxy.ts)
 */
export type SiteVisibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'PASSWORD_PROTECTED';

const ALL: SiteVisibility[] = ['PUBLIC', 'UNLISTED', 'PRIVATE', 'PASSWORD_PROTECTED'];

export function getVisibility(): SiteVisibility {
  const raw = (process.env.SITE_VISIBILITY ?? 'PRIVATE').toUpperCase() as SiteVisibility;
  return ALL.includes(raw) ? raw : 'PRIVATE';
}

export function isIndexable(): boolean {
  return getVisibility() === 'PUBLIC';
}

export function requiresAccessCode(): boolean {
  return getVisibility() === 'PASSWORD_PROTECTED';
}

export const ACCESS_COOKIE = 'akw_access';
