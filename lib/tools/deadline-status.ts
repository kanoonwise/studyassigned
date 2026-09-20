const DAY_MS = 24 * 60 * 60 * 1000;

/** True once a verified date is in the past - the public page then hides the countdown. */
export function isPastDate(dateIso: string, today: Date = new Date()): boolean {
  const date = new Date(`${dateIso}T00:00:00Z`);
  const todayStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  return date.getTime() < todayStart.getTime();
}

export function daysUntil(dateIso: string, today: Date = new Date()): number {
  const date = new Date(`${dateIso}T00:00:00Z`);
  const todayStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  return Math.round((date.getTime() - todayStart.getTime()) / DAY_MS);
}

export interface ServiceSuggestion {
  label: string;
  href: string;
}

/**
 * A contextual nudge shown near a verified deadline - never a hard sell,
 * just a relevant next step. Only fires within a sensible lead time before
 * an evaluation-type event.
 */
export function suggestServiceForDeadline(
  eventType: string,
  daysUntilEvent: number,
): ServiceSuggestion | null {
  if (daysUntilEvent < 0 || daysUntilEvent > 30) return null;
  if (/exam|evaluation|mid-?sem|viva/i.test(eventType)) {
    return { label: "Draft review before evaluation", href: "/services" };
  }
  if (/submission|thesis|dissertation|synopsis/i.test(eventType)) {
    return { label: "Editing and citation help before you submit", href: "/services" };
  }
  return null;
}
