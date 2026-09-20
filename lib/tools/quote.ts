export type PriceUnit = "per_word" | "per_page" | "per_doc" | "per_project";

const UNIT_LABELS: Record<PriceUnit, string> = {
  per_word: "per word",
  per_page: "per page",
  per_doc: "per document",
  per_project: "per project",
};

export function unitLabel(unit: string): string {
  return UNIT_LABELS[unit as PriceUnit] ?? unit;
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

/** e.g. "₹499 – ₹1,499 per document", or a fallback when a price isn't set yet. */
export function formatPriceRange(low: number | null, high: number | null, unit: string): string {
  if (low == null && high == null) return "Contact us for a quote";
  if (low != null && high != null && low !== high) {
    return `${inr.format(low)} – ${inr.format(high)} ${unitLabel(unit)}`;
  }
  const single = low ?? high!;
  return `${inr.format(single)} ${unitLabel(unit)}`;
}

export function formatInr(amount: number): string {
  return inr.format(amount);
}

/**
 * Rush-turnaround multipliers. Not a BUILD_SPEC.md table (Section 3 has
 * none for this), so it's a parameter with a documented default rather
 * than a hardcoded constant inside the calculator - an admin-editable
 * `rush_tiers` table can replace this default without touching the
 * calculation logic.
 */
export interface RushTier {
  maxDays: number;
  multiplier: number;
}

export const DEFAULT_RUSH_TIERS: RushTier[] = [
  { maxDays: 2, multiplier: 1.5 },
  { maxDays: 5, multiplier: 1.2 },
  { maxDays: Infinity, multiplier: 1 },
];

export function rushMultiplierFor(
  turnaroundDays: number,
  tiers: RushTier[] = DEFAULT_RUSH_TIERS,
): number {
  const sorted = [...tiers].sort((a, b) => a.maxDays - b.maxDays);
  const tier = sorted.find((t) => turnaroundDays <= t.maxDays);
  return tier?.multiplier ?? sorted[sorted.length - 1].multiplier;
}

export interface QuoteInput {
  priceLow: number | null;
  priceHigh: number | null;
  quantity: number;
  turnaroundDays: number;
  rushTiers?: RushTier[];
}

export interface QuoteResult {
  low: number | null;
  high: number | null;
  multiplier: number;
}

/** Instant Quote Calculator. Never promises a final price - only a range. */
export function calculateQuote({
  priceLow,
  priceHigh,
  quantity,
  turnaroundDays,
  rushTiers,
}: QuoteInput): QuoteResult {
  const multiplier = rushMultiplierFor(turnaroundDays, rushTiers);
  return {
    low: priceLow == null ? null : Math.round(priceLow * quantity * multiplier * 100) / 100,
    high: priceHigh == null ? null : Math.round(priceHigh * quantity * multiplier * 100) / 100,
    multiplier,
  };
}
