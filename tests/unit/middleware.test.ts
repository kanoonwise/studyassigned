import { describe, expect, it } from "vitest";
import { shouldRedirectFromAdmin } from "@/lib/supabase/middleware";

describe("shouldRedirectFromAdmin", () => {
  it("redirects a signed-out visitor away from /admin", () => {
    expect(shouldRedirectFromAdmin("/admin", false)).toBe(true);
    expect(shouldRedirectFromAdmin("/admin/imports", false)).toBe(true);
  });

  it("lets a signed-in visitor reach /admin (role is checked separately)", () => {
    expect(shouldRedirectFromAdmin("/admin", true)).toBe(false);
  });

  it("never redirects public pages", () => {
    expect(shouldRedirectFromAdmin("/", false)).toBe(false);
    expect(shouldRedirectFromAdmin("/login", false)).toBe(false);
  });
});
