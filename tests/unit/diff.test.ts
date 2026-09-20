import { describe, expect, it } from "vitest";
import { computeDiff, findVerifiedConflicts } from "@/lib/import/diff";

interface Row {
  code: string;
  name: string;
  status: string;
}

describe("computeDiff", () => {
  const current: Row[] = [
    { code: "A", name: "Alpha", status: "manual_required" },
    { code: "B", name: "Beta", status: "link_found" },
    { code: "C", name: "Gamma", status: "verified" },
  ];

  it("finds added rows not present in current", () => {
    const staged: Row[] = [...current, { code: "D", name: "Delta", status: "manual_required" }];
    const result = computeDiff(staged, current, "code", ["name", "status"]);
    expect(result.added).toEqual([{ code: "D", name: "Delta", status: "manual_required" }]);
  });

  it("finds changed rows and lists which fields changed", () => {
    const staged: Row[] = [
      { code: "A", name: "Alpha", status: "manual_required" },
      { code: "B", name: "Beta", status: "verified" },
      { code: "C", name: "Gamma", status: "verified" },
    ];
    const result = computeDiff(staged, current, "code", ["name", "status"]);
    expect(result.changed).toEqual([
      { key: "B", before: current[1], after: staged[1], changedFields: ["status"] },
    ]);
  });

  it("finds removed rows present in current but not staged", () => {
    const staged: Row[] = current.slice(0, 2);
    const result = computeDiff(staged, current, "code", ["name", "status"]);
    expect(result.removed).toEqual(["C"]);
  });

  it("counts unchanged rows", () => {
    const result = computeDiff(current, current, "code", ["name", "status"]);
    expect(result.unchangedCount).toBe(3);
    expect(result.added).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
  });
});

interface DeadlineRow {
  authority_code: string;
  event_type: string;
  status: string;
  exact_date: string | null;
}

describe("findVerifiedConflicts", () => {
  it("flags a verified date that would change to a different verified date", () => {
    const current: DeadlineRow[] = [
      {
        authority_code: "U-1",
        event_type: "Mid-sem",
        status: "verified",
        exact_date: "2026-09-12",
      },
    ];
    const staged: DeadlineRow[] = [
      {
        authority_code: "U-1",
        event_type: "Mid-sem",
        status: "verified",
        exact_date: "2026-09-20",
      },
    ];
    const conflicts = findVerifiedConflicts(staged, current);
    expect(conflicts).toEqual([
      {
        authorityCode: "U-1",
        eventType: "Mid-sem",
        currentDate: "2026-09-12",
        incomingDate: "2026-09-20",
      },
    ]);
  });

  it("does not flag when the verified date matches", () => {
    const current: DeadlineRow[] = [
      {
        authority_code: "U-1",
        event_type: "Mid-sem",
        status: "verified",
        exact_date: "2026-09-12",
      },
    ];
    const staged: DeadlineRow[] = [
      {
        authority_code: "U-1",
        event_type: "Mid-sem",
        status: "verified",
        exact_date: "2026-09-12",
      },
    ];
    expect(findVerifiedConflicts(staged, current)).toHaveLength(0);
  });

  it("does not flag when the current row isn't verified yet", () => {
    const current: DeadlineRow[] = [
      { authority_code: "U-1", event_type: "Mid-sem", status: "link_found", exact_date: null },
    ];
    const staged: DeadlineRow[] = [
      {
        authority_code: "U-1",
        event_type: "Mid-sem",
        status: "verified",
        exact_date: "2026-09-12",
      },
    ];
    expect(findVerifiedConflicts(staged, current)).toHaveLength(0);
  });
});
