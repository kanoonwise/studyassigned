import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature, toPaise } from "@/lib/payments/razorpay";

describe("verifyWebhookSignature", () => {
  const secret = "whsec_test";
  const body = JSON.stringify({ event: "payment.captured" });

  it("accepts a correctly signed payload", () => {
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    const tampered = JSON.stringify({ event: "payment.failed" });
    expect(verifyWebhookSignature(tampered, signature, secret)).toBe(false);
  });

  it("rejects a signature signed with the wrong secret", () => {
    const signature = createHmac("sha256", "wrong-secret").update(body).digest("hex");
    expect(verifyWebhookSignature(body, signature, secret)).toBe(false);
  });

  it("rejects a malformed signature without throwing", () => {
    expect(verifyWebhookSignature(body, "not-hex-and-wrong-length", secret)).toBe(false);
  });
});

describe("toPaise", () => {
  it("converts rupees to paise", () => {
    expect(toPaise(499)).toBe(49900);
    expect(toPaise(19.5)).toBe(1950);
  });
});
