import { describe, expect, it } from "vitest";
import { addMonths, calculateResubmission } from "@/lib/tools/resubmission";

describe("addMonths", () => {
  it("adds whole months", () => {
    expect(addMonths(new Date("2026-01-15"), 6).toISOString().slice(0, 10)).toBe("2026-07-15");
  });

  it("handles year rollover", () => {
    expect(addMonths(new Date("2026-11-01"), 3).toISOString().slice(0, 10)).toBe("2027-02-01");
  });
});

describe("calculateResubmission", () => {
  it("returns null when there's no action window (e.g. Level 0)", () => {
    expect(calculateResubmission(new Date("2026-01-01"), null)).toBeNull();
  });

  it("computes the last resubmission date and days left for Level 1 (6 months)", () => {
    const reportDate = new Date("2026-01-01");
    const today = new Date("2026-01-01");
    const result = calculateResubmission(reportDate, 6, today);
    expect(result?.lastResubmissionDate.toISOString().slice(0, 10)).toBe("2026-07-01");
    expect(result?.daysLeft).toBeGreaterThan(0);
  });

  it("reports negative days left once the window has passed", () => {
    const reportDate = new Date("2020-01-01");
    const today = new Date("2026-01-01");
    const result = calculateResubmission(reportDate, 6, today);
    expect(result?.daysLeft).toBeLessThan(0);
  });

  it("builds a week-by-week plan ending in submission", () => {
    const result = calculateResubmission(new Date("2026-01-01"), 6, new Date("2026-01-01"));
    expect(result?.plan.length).toBeGreaterThan(1);
    expect(result?.plan[0].week).toBe(1);
    expect(result?.plan.at(-1)?.task).toMatch(/proofread and submit/);
  });

  it("scales the plan length with a longer window (Level 2, 12 months)", () => {
    const short = calculateResubmission(new Date("2026-01-01"), 6, new Date("2026-01-01"));
    const long = calculateResubmission(new Date("2026-01-01"), 12, new Date("2026-01-01"));
    expect(long!.plan.length).toBeGreaterThan(short!.plan.length);
  });
});
