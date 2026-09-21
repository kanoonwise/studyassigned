const REFERRAL_COOKIE = "sa_ref";
const MAX_LENGTH = 32;

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

export { REFERRAL_COOKIE };
