import { describe, expect, it } from "vitest";
import { sanitizeReferralCode, referralCookieMaxAge } from "@/lib/referral";

describe("sanitizeReferralCode", () => {
  it("uppercases a clean code", () => {
    expect(sanitizeReferralCode("iitd-fest")).toBe("IITD-FEST");
  });

  it("strips characters that could break a cookie or column value", () => {
    expect(sanitizeReferralCode("abc; Set-Cookie: x=1")).toBe("ABCSET-COOKIEX1");
    expect(sanitizeReferralCode("a\nb")).toBe("AB");
  });

  it("truncates to a maximum length", () => {
    const long = "a".repeat(100);
    expect(sanitizeReferralCode(long)?.length).toBe(32);
  });

  it("returns null for empty or all-invalid input", () => {
    expect(sanitizeReferralCode("")).toBeNull();
    expect(sanitizeReferralCode(null)).toBeNull();
    expect(sanitizeReferralCode(undefined)).toBeNull();
    expect(sanitizeReferralCode("   ")).toBeNull();
    expect(sanitizeReferralCode(";;;")).toBeNull();
  });
});

describe("referralCookieMaxAge", () => {
  it("is session-only (undefined) without consent", () => {
    expect(referralCookieMaxAge(false)).toBeUndefined();
  });

  it("is a 30-day persistent cookie once consented", () => {
    expect(referralCookieMaxAge(true)).toBe(60 * 60 * 24 * 30);
  });
});
