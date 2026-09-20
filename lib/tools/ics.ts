import type { TimelineMilestone } from "./timeline";

function formatIcsDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function escapeIcsText(text: string): string {
  return text.replace(/([,;\\])/g, "\\$1");
}

/** Builds an RFC 5545 .ics calendar (all-day events) from timeline milestones. */
export function buildTimelineIcs(milestones: TimelineMilestone[], calendarName: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//StudyAssigned//Thesis Timeline Planner//EN",
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ];

  for (const milestone of milestones) {
    const start = formatIcsDate(milestone.date);
    const end = formatIcsDate(new Date(milestone.date.getTime() + 24 * 60 * 60 * 1000));
    lines.push(
      "BEGIN:VEVENT",
      `UID:${start}-${milestone.key}@studyassigned.example`,
      `DTSTAMP:${formatIcsDate(new Date())}T000000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeIcsText(milestone.label)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
