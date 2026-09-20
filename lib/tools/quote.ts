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
