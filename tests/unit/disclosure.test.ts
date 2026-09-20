import { describe, expect, it } from "vitest";
import { generateDisclosureStatement } from "@/lib/tools/disclosure";

describe("generateDisclosureStatement", () => {
  it("includes the tools, purpose, sections and date range", () => {
    const statement = generateDisclosureStatement({
      toolsUsed: ["ChatGPT", "Grammarly"],
      purpose: "Checking grammar and sentence structure",
      sections: ["Introduction", "Discussion"],
      fromDate: new Date("2026-01-05"),
      toDate: new Date("2026-01-20"),
    });

    expect(statement).toContain("ChatGPT, Grammarly");
    expect(statement).toContain("Checking grammar and sentence structure");
    expect(statement).toContain("Introduction, Discussion");
    expect(statement).toContain("5 January 2026");
    expect(statement).toContain("20 January 2026");
  });

  it("always tells the reader to check their institution's own policy", () => {
    const statement = generateDisclosureStatement({
      toolsUsed: [],
      purpose: "",
      sections: [],
      fromDate: new Date("2026-01-01"),
      toDate: new Date("2026-01-01"),
    });
    expect(statement).toMatch(/institution's own AI-use policy/);
  });
});
