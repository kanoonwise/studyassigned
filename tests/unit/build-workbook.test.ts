import { describe, expect, it } from "vitest";
import { institutionsToCsv } from "@/lib/import/build-workbook";
import type { Database } from "@/lib/supabase/types";

type Institution = Database["public"]["Tables"]["institutions"]["Row"];

function institution(overrides: Partial<Institution>): Institution {
  return {
    aishe_code: "C-1",
    kind: "College",
    name: "Test College",
    state: "Delhi",
    district: null,
    address: null,
    website: null,
    inst_type: null,
    management: null,
    affiliating_code: null,
    affiliating_name: null,
    urban_rural: null,
    established: null,
    calendar_authority_code: null,
    status: "manual_required",
    last_checked: null,
    priority_rank: null,
    base_score: null,
    geo_target: null,
    maps_url: null,
    inner_km: null,
    outer_km: null,
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("institutionsToCsv", () => {
  it("includes a header row and one row per institution", () => {
    const csv = institutionsToCsv([institution({}), institution({ aishe_code: "C-2" })]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("aishe_code,name,state,district,kind,status,last_checked");
    expect(lines).toHaveLength(3);
  });

  it("escapes commas and quotes", () => {
    const csv = institutionsToCsv([institution({ name: 'Test, "Best" College' })]);
    expect(csv).toContain('"Test, ""Best"" College"');
  });
});
