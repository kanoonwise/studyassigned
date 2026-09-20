import { describe, expect, it } from "vitest";
import { calculateUgcLevel, findUgcLevel, type UgcLevelConfig } from "@/lib/tools/ugc-level";

const LEVELS: UgcLevelConfig[] = [
  {
    level: 0,
    min_pct: 0,
    max_pct: 10,
    label: "Level 0",
    consequence: "No penalty.",
    action_window_months: null,
  },
  {
    level: 1,
    min_pct: 10,
    max_pct: 40,
    label: "Level 1",
    consequence: "Revise and resubmit within a set period (maximum 6 months).",
    action_window_months: 6,
  },
  {
    level: 2,
    min_pct: 40,
    max_pct: 60,
    label: "Level 2",
    consequence: "Barred from submitting a revised thesis for one year.",
    action_window_months: 12,
  },
  {
    level: 3,
    min_pct: 60,
    max_pct: null,
    label: "Level 3",
    consequence: "PhD registration may be cancelled; UG/PG suspension.",
    action_window_months: null,
  },
];

describe("findUgcLevel", () => {
  it("matches Level 0 at 0%", () => {
    expect(findUgcLevel(0, LEVELS)?.level).toBe(0);
  });

  it("matches Level 0 at exactly 10% (inclusive upper bound)", () => {
    expect(findUgcLevel(10, LEVELS)?.level).toBe(0);
  });

  it("matches Level 1 just above 10%", () => {
    expect(findUgcLevel(10.01, LEVELS)?.level).toBe(1);
  });

  it("matches Level 1 at exactly 40%", () => {
    expect(findUgcLevel(40, LEVELS)?.level).toBe(1);
  });

  it("matches Level 2 just above 40%", () => {
    expect(findUgcLevel(40.01, LEVELS)?.level).toBe(2);
  });

  it("matches Level 2 at exactly 60%", () => {
    expect(findUgcLevel(60, LEVELS)?.level).toBe(2);
  });

  it("matches Level 3 just above 60%", () => {
    expect(findUgcLevel(60.01, LEVELS)?.level).toBe(3);
  });

  it("matches Level 3 for a high percentage with no upper bound", () => {
    expect(findUgcLevel(95, LEVELS)?.level).toBe(3);
  });

  it("returns null when levels are empty", () => {
    expect(findUgcLevel(20, [])).toBeNull();
  });
});

describe("calculateUgcLevel", () => {
  it("adds an exclusion note when references/quotes weren't already excluded", () => {
    const result = calculateUgcLevel(15, false, LEVELS);
    expect(result?.match.level).toBe(1);
    expect(result?.exclusionNote).toMatch(/references/);
  });

  it("omits the exclusion note when they were already excluded", () => {
    const result = calculateUgcLevel(15, true, LEVELS);
    expect(result?.exclusionNote).toBeNull();
  });
});
