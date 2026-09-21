const REFERRAL_COOKIE = "sa_ref";
const CONSENT_COOKIE = "sa_consent";
const MAX_LENGTH = 32;
const PERSISTENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Keeps a ?ref= value safe to store in a cookie and a text column: no
 * separators, no whitespace, nothing that could break a Set-Cookie header. */
export function sanitizeReferralCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw
    .trim()
    .slice(0, MAX_LENGTH)
    .replace(/[^a-zA-Z0-9_-]/g, "");
  return cleaned.length > 0 ? cleaned.toUpperCase() : null;
}

/**
 * Without cookie consent, the referral code still needs to survive to the
 * end of this visit so an immediate enquiry gets credited - but it must
 * not persist as long-term tracking. `undefined` (a session cookie, gone
 * when the browser closes) is the honest answer until the visitor
 * consents; only then does it become the full 30-day attribution window.
 */
export function referralCookieMaxAge(consented: boolean): number | undefined {
  return consented ? PERSISTENT_MAX_AGE_SECONDS : undefined;
}

export { REFERRAL_COOKIE, CONSENT_COOKIE };
