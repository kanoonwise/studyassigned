import { describe, expect, it } from "vitest";
import { calculateQuote, formatPriceRange, rushMultiplierFor, unitLabel } from "@/lib/tools/quote";

describe("unitLabel", () => {
  it("maps known units to readable labels", () => {
    expect(unitLabel("per_word")).toBe("per word");
    expect(unitLabel("per_project")).toBe("per project");
  });

  it("falls back to the raw value for an unknown unit", () => {
    expect(unitLabel("per_fortnight")).toBe("per_fortnight");
  });
});

describe("formatPriceRange", () => {
  it("formats a range", () => {
    expect(formatPriceRange(499, 1499, "per_doc")).toBe("₹499.00 – ₹1,499.00 per document");
  });

  it("formats a single price when low equals high", () => {
    expect(formatPriceRange(500, 500, "per_page")).toBe("₹500.00 per page");
  });

  it("falls back when no price is set", () => {
    expect(formatPriceRange(null, null, "per_word")).toBe("Contact us for a quote");
  });
});

describe("rushMultiplierFor", () => {
  it("applies the highest multiplier for the shortest turnaround", () => {
    expect(rushMultiplierFor(1)).toBe(1.5);
    expect(rushMultiplierFor(2)).toBe(1.5);
  });

  it("applies the mid multiplier for a moderate turnaround", () => {
    expect(rushMultiplierFor(3)).toBe(1.2);
    expect(rushMultiplierFor(5)).toBe(1.2);
  });

  it("applies no multiplier for a relaxed turnaround", () => {
    expect(rushMultiplierFor(14)).toBe(1);
  });
});

describe("calculateQuote", () => {
  it("scales price by quantity and rush multiplier", () => {
    const result = calculateQuote({
      priceLow: 10,
      priceHigh: 20,
      quantity: 100,
      turnaroundDays: 14,
    });
    expect(result).toEqual({ low: 1000, high: 2000, multiplier: 1 });
  });

  it("applies the rush multiplier", () => {
    const result = calculateQuote({
      priceLow: 10,
      priceHigh: 20,
      quantity: 100,
      turnaroundDays: 1,
    });
    expect(result).toEqual({ low: 1500, high: 3000, multiplier: 1.5 });
  });

  it("passes through nulls when a price isn't set", () => {
    const result = calculateQuote({
      priceLow: null,
      priceHigh: null,
      quantity: 10,
      turnaroundDays: 10,
    });
    expect(result.low).toBeNull();
    expect(result.high).toBeNull();
  });
});
