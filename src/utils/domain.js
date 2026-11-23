// Single source of truth for the allowed email domain.
export const ALLOWED_DOMAIN = (process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit')
  .trim()
  .toLowerCase();

export const RESTRICTED_MESSAGE =
  'Access restricted. Please login using your official domain email.';

/**
 * True only when the email's domain is EXACTLY the allowed domain.
 * Uses the part after the last "@", so "x@hbplus.fit.evil.com" and
 * "x@evilhbplus.fit" are both rejected (a naive endsWith check would
 * accept the second one).
 */
export function isAllowedEmail(email) {
  if (typeof email !== 'string') return false;
  const at = email.lastIndexOf('@');
  if (at < 1) return false;
  return email.slice(at + 1).trim().toLowerCase() === ALLOWED_DOMAIN;
}

const ADMIN_EMAILS = (process.env.EXPO_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function roleFor(email) {
  return ADMIN_EMAILS.includes((email || '').toLowerCase()) ? 'admin' : 'user';
}
