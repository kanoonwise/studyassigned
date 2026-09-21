import { describe, expect, it } from "vitest";
import { buildVaultTimeline, buildAuthorshipReportLines } from "@/lib/vault";

describe("buildVaultTimeline", () => {
  it("orders documents oldest first and numbers versions", () => {
    const timeline = buildVaultTimeline([
      {
        id: "b",
        path: "u/second.pdf",
        sha256: "bbb",
        uploaded_at: "2026-02-01",
        version_label: null,
      },
      {
        id: "a",
        path: "u/first.pdf",
        sha256: "aaa",
        uploaded_at: "2026-01-01",
        version_label: "Draft 1",
      },
    ]);
    expect(timeline.map((e) => e.id)).toEqual(["a", "b"]);
    expect(timeline[0].version).toBe(1);
    expect(timeline[0].label).toBe("Draft 1");
    expect(timeline[1].version).toBe(2);
    expect(timeline[1].label).toBe("Version 2");
    expect(timeline[1].filename).toBe("second.pdf");
  });

  it("returns an empty timeline for no documents", () => {
    expect(buildVaultTimeline([])).toEqual([]);
  });
});

describe("buildAuthorshipReportLines", () => {
  it("includes the disclaimer and one block per version", () => {
    const timeline = buildVaultTimeline([
      {
        id: "a",
        path: "u/thesis-v1.pdf",
        sha256: "hash1",
        uploaded_at: "2026-01-01",
        version_label: null,
      },
    ]);
    const lines = buildAuthorshipReportLines("My Thesis", "Asha Rao", timeline);
    expect(lines.join("\n")).toContain("not proof of originality or a promised result");
    expect(lines.join("\n")).toContain("My Thesis");
    expect(lines.join("\n")).toContain("Asha Rao");
    expect(lines.join("\n")).toContain("hash1");
  });
});
