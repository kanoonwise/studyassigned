import { describe, expect, it } from "vitest";
import { clientIpFrom, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    const opts = { limit: 3, windowMs: 60_000 };

    expect(rateLimit(key, opts).success).toBe(true);
    expect(rateLimit(key, opts).success).toBe(true);
    expect(rateLimit(key, opts).success).toBe(true);
    const fourth = rateLimit(key, opts);
    expect(fourth.success).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("resets after the window passes", async () => {
    const key = `test-${Math.random()}`;
    const opts = { limit: 1, windowMs: 5 };

    expect(rateLimit(key, opts).success).toBe(true);
    expect(rateLimit(key, opts).success).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(rateLimit(key, opts).success).toBe(true);
  });
});

describe("clientIpFrom", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIpFrom(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip, then unknown", () => {
    expect(clientIpFrom(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientIpFrom(new Headers())).toBe("unknown");
  });
});
