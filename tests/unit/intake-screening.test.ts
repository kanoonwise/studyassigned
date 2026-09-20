import { describe, expect, it } from "vitest";
import { screenEnquiry } from "@/lib/intake-screening";

describe("screenEnquiry", () => {
  it("flags a request to write the thesis", () => {
    const result = screenEnquiry("Can you write my thesis by Friday?");
    expect(result.flagged).toBe(true);
    expect(result.reason).toMatch(/write their thesis/);
  });

  it("flags a request to lower a similarity score", () => {
    expect(screenEnquiry("I need to reduce my Turnitin similarity score").flagged).toBe(true);
  });

  it("flags a request for fake data", () => {
    expect(screenEnquiry("I need fake data for my results chapter").flagged).toBe(true);
  });

  it("flags a request to bypass an originality tool", () => {
    expect(screenEnquiry("Is there a cracked Turnitin I can use?").flagged).toBe(true);
  });

  it("flags exam help", () => {
    expect(screenEnquiry("Can someone take my exam for me?").flagged).toBe(true);
  });

  it("does not flag a legitimate editing request", () => {
    const result = screenEnquiry(
      "I'd like help understanding my similarity report and editing my draft.",
    );
    expect(result.flagged).toBe(false);
    expect(result.reason).toBeNull();
  });
});
