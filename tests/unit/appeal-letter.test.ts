import { describe, expect, it } from "vitest";
import { generateAppealLetter } from "@/lib/tools/appeal-letter";

describe("generateAppealLetter", () => {
  it("includes the student, institution, grounds and evidence", () => {
    const letter = generateAppealLetter({
      studentName: "Asha Rao",
      institutionName: "Test University",
      panelName: "Academic Integrity Panel",
      decisionSummary: "Flagged as AI-generated on 1 Jan 2026.",
      grounds: ["The tool has known false-positive issues", "I have drafts predating the flag"],
      evidence: ["Draft history", "Supervisor email"],
    });

    expect(letter).toContain("Asha Rao");
    expect(letter).toContain("Test University");
    expect(letter).toContain("Academic Integrity Panel");
    expect(letter).toContain("1. The tool has known false-positive issues");
    expect(letter).toContain("- Draft history");
  });

  it("falls back to placeholders when fields are empty", () => {
    const letter = generateAppealLetter({
      studentName: "",
      institutionName: "",
      panelName: "",
      decisionSummary: "",
      grounds: [],
      evidence: [],
    });
    expect(letter).toContain("[your name]");
    expect(letter).toContain("[state your grounds for appeal]");
  });

  it("always tells the reader to check their institution's own procedure", () => {
    const letter = generateAppealLetter({
      studentName: "A",
      institutionName: "B",
      panelName: "C",
      decisionSummary: "D",
      grounds: [],
      evidence: [],
    });
    expect(letter).toMatch(/institution's own appeal procedure/);
  });
});
