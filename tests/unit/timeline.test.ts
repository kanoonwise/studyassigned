import { describe, expect, it } from "vitest";
import { calculateTimeline } from "@/lib/tools/timeline";
import { buildTimelineIcs } from "@/lib/tools/ics";

describe("calculateTimeline", () => {
  it("returns 9 milestones ending on the submission date", () => {
    const submissionDate = new Date("2026-12-01");
    const milestones = calculateTimeline(submissionDate, "UG");
    expect(milestones).toHaveLength(9);
    expect(milestones.at(-1)).toMatchObject({ key: "final" });
    expect(milestones.at(-1)!.date.getTime()).toBe(submissionDate.getTime());
  });

  it("orders milestones chronologically ascending", () => {
    const milestones = calculateTimeline(new Date("2026-12-01"), "PhD");
    for (let i = 1; i < milestones.length; i++) {
      expect(milestones[i].date.getTime()).toBeGreaterThan(milestones[i - 1].date.getTime());
    }
  });

  it("gives a PhD timeline more lead time than a UG timeline", () => {
    const submissionDate = new Date("2026-12-01");
    const ug = calculateTimeline(submissionDate, "UG");
    const phd = calculateTimeline(submissionDate, "PhD");
    expect(phd[0].date.getTime()).toBeLessThan(ug[0].date.getTime());
  });
});

describe("buildTimelineIcs", () => {
  it("produces a valid-looking VCALENDAR with one VEVENT per milestone", () => {
    const milestones = calculateTimeline(new Date("2026-12-01"), "UG");
    const ics = buildTimelineIcs(milestones, "My Thesis Timeline");
    expect(ics).toMatch(/^BEGIN:VCALENDAR/);
    expect(ics).toMatch(/END:VCALENDAR$/);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(9);
    expect(ics).toContain("SUMMARY:Final submission");
  });

  it("escapes commas and semicolons in the calendar name", () => {
    const ics = buildTimelineIcs([], "Plan, v2; final");
    expect(ics).toContain("X-WR-CALNAME:Plan\\, v2\\; final");
  });
});
