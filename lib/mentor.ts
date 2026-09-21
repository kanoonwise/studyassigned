export interface MentorBookingSummary {
  mentor_id: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface MentorWorkload {
  mentorId: string;
  scheduled: number;
  completed: number;
  cancelled: number;
  total: number;
}

/** Ops workload view: per-mentor counts by booking status, busiest first. */
export function summarizeMentorWorkload(bookings: MentorBookingSummary[]): MentorWorkload[] {
  const byMentor = new Map<string, MentorWorkload>();
  for (const booking of bookings) {
    const existing = byMentor.get(booking.mentor_id) ?? {
      mentorId: booking.mentor_id,
      scheduled: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
    };
    existing[booking.status] += 1;
    existing.total += 1;
    byMentor.set(booking.mentor_id, existing);
  }
  return [...byMentor.values()].sort((a, b) => b.scheduled - a.scheduled);
}

export type ErrorType = "grammar" | "structure" | "citation" | "argument" | "clarity" | "other";

export const ERROR_TYPE_LABELS: Record<ErrorType, string> = {
  grammar: "Grammar",
  structure: "Structure",
  citation: "Citation",
  argument: "Argument",
  clarity: "Clarity",
  other: "Other",
};
