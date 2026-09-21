import type { DeadlineStatus } from "@/lib/supabase/types";

/** Sheet text -> enum, per BUILD_SPEC.md Section 4. Matching is exact after trimming. */
const STATUS_TEXT_TO_ENUM: Record<string, DeadlineStatus> = {
  "Exact official academic window verified": "verified",
  "Official calendar link discovered — verify date": "link_found",
  "Official calendar link discovered — verify content": "link_found",
  "Affiliating university proxy / manual verification": "proxy",
  "Seasonality only — no exact date": "seasonality_only",
  "Manual official-site verification required": "manual_required",
};

export function mapStatusText(text: string | null | undefined): DeadlineStatus | null {
  if (!text) return null;
  return STATUS_TEXT_TO_ENUM[text.trim()] ?? null;
}

export const KNOWN_STATUS_TEXTS = Object.keys(STATUS_TEXT_TO_ENUM);
