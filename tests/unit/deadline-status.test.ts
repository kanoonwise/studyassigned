import { describe, expect, it } from "vitest";
import { isPastDate, daysUntil, suggestServiceForDeadline } from "@/lib/tools/deadline-status";

describe("isPastDate", () => {
  it("is true for a date before today", () => {
    expect(isPastDate("2026-01-01", new Date("2026-06-01"))).toBe(true);
  });

  it("is false for today", () => {
    expect(isPastDate("2026-06-01", new Date("2026-06-01T15:00:00Z"))).toBe(false);
  });

  it("is false for a future date", () => {
    expect(isPastDate("2026-12-01", new Date("2026-06-01"))).toBe(false);
  });

  it("matches the spec example: a mid-semester window on 2026-09-12 has passed by 2026-09-20", () => {
    expect(isPastDate("2026-09-12", new Date("2026-09-20"))).toBe(true);
  });
});

describe("daysUntil", () => {
  it("counts whole days to a future date", () => {
    expect(daysUntil("2026-06-15", new Date("2026-06-01"))).toBe(14);
  });

  it("is negative for a past date", () => {
    expect(daysUntil("2026-05-01", new Date("2026-06-01"))).toBe(-31);
  });
});

describe("suggestServiceForDeadline", () => {
  it("suggests draft review ahead of an exam", () => {
    expect(suggestServiceForDeadline("Mid-semester examination window begins", 10)).toEqual({
      label: "Draft review before evaluation",
      href: "/services",
    });
  });

  it("suggests editing help ahead of a thesis submission", () => {
    expect(suggestServiceForDeadline("Thesis submission deadline", 5)?.label).toMatch(/Editing/);
  });

  it("suggests nothing for an unrelated event type", () => {
    expect(suggestServiceForDeadline("Convocation", 5)).toBeNull();
  });

  it("suggests nothing once the date has passed or is too far out", () => {
    expect(suggestServiceForDeadline("Exam", -1)).toBeNull();
    expect(suggestServiceForDeadline("Exam", 45)).toBeNull();
  });
});
