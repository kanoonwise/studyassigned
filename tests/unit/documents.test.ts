import { describe, expect, it } from "vitest";
import { isAllowedDocumentType, computeDeleteAfter } from "@/lib/documents";

describe("isAllowedDocumentType", () => {
  it("allows PDF and DOCX", () => {
    expect(isAllowedDocumentType("application/pdf")).toBe(true);
    expect(
      isAllowedDocumentType(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    ).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isAllowedDocumentType("application/zip")).toBe(false);
    expect(isAllowedDocumentType("image/png")).toBe(false);
  });
});

describe("computeDeleteAfter", () => {
  it("defaults to 90 days out", () => {
    expect(computeDeleteAfter(new Date("2026-01-01"))).toBe("2026-04-01");
  });

  it("respects a custom retention period", () => {
    expect(computeDeleteAfter(new Date("2026-01-01"), 30)).toBe("2026-01-31");
  });
});
