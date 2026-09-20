import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import {
  findHeaderRow,
  parseInstitutionsSheet,
  parseAuthoritiesSheet,
  parseServicePricesSheet,
} from "@/lib/import/parse-workbook";

function institutionsWorkbook() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Active 8K Intelligence");
  // Rows 1-4 are merged title rows, matching the real workbook's layout.
  sheet.addRow(["Active 8K Institution Intelligence"]);
  sheet.addRow(["Generated 2026"]);
  sheet.addRow([]);
  sheet.addRow([]);
  sheet.addRow([
    "Priority Rank",
    "AISHE Code",
    "Kind",
    "Institution",
    "State / UT",
    "District",
    "Deadline Status",
    "Last Checked",
  ]);
  sheet.addRow([
    1,
    "C-46831",
    "College",
    "Test College",
    "Delhi",
    "South Delhi",
    "Exact official academic window verified",
    new Date("2026-01-01"),
  ]);
  sheet.addRow([
    2,
    "U-0549",
    "University",
    "Test University",
    "Delhi",
    "New Delhi",
    "Official calendar link discovered — verify date",
    "16 Jan 2026",
  ]);
  sheet.addRow([
    3,
    "C-99999",
    "College",
    "Bad Status College",
    "Kerala",
    "Kochi",
    "Not a real status",
    null,
  ]);
  sheet.addRow([
    4,
    "C-46831",
    "College",
    "Duplicate",
    "Delhi",
    "South Delhi",
    "Exact official academic window verified",
    null,
  ]);
  return { workbook, sheet };
}

describe("findHeaderRow", () => {
  it("locates the header row by content, not a fixed row number", () => {
    const { sheet } = institutionsWorkbook();
    const header = findHeaderRow(sheet, "AISHE Code");
    expect(header?.headerRow).toBe(5);
    expect(header?.columns["Institution"]).toBeDefined();
  });

  it("returns null when the expected header never appears", () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Empty");
    sheet.addRow(["Nothing here"]);
    expect(findHeaderRow(sheet, "AISHE Code")).toBeNull();
  });
});

describe("parseInstitutionsSheet", () => {
  it("parses valid rows and maps status text to the enum", () => {
    const { sheet } = institutionsWorkbook();
    const { rows, errors } = parseInstitutionsSheet(sheet);

    const first = rows.find((r) => r.aishe_code === "C-46831");
    expect(first).toMatchObject({ kind: "College", name: "Test College", status: "verified" });

    const second = rows.find((r) => r.aishe_code === "U-0549");
    expect(second?.status).toBe("link_found");
    expect(second?.last_checked).toBe("2026-01-16");

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining("Unknown status") }),
      ]),
    );
  });

  it("flags duplicate AISHE codes and skips the duplicate", () => {
    const { sheet } = institutionsWorkbook();
    const { rows, errors } = parseInstitutionsSheet(sheet);
    expect(rows.filter((r) => r.aishe_code === "C-46831")).toHaveLength(1);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: expect.stringContaining("Duplicate") }),
      ]),
    );
  });
});

describe("parseAuthoritiesSheet", () => {
  it("parses authorities and their linked deadlines", () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Deadline Tracker");
    sheet.addRow(["Title row"]);
    sheet.addRow([]);
    sheet.addRow([
      "Authority AISHE Code",
      "Calendar Authority",
      "State",
      "Active 8K Covered",
      "Deadline Status",
      "Exact Date",
      "Deadline / Submission Type",
      "Evidence URL",
    ]);
    sheet.addRow([
      "U-0549",
      "Test University",
      "Delhi",
      42,
      "Exact official academic window verified",
      new Date("2026-09-12"),
      "Mid-semester examination window begins",
      "https://example.edu/notice",
    ]);

    const { authorities, deadlines, errors } = parseAuthoritiesSheet(sheet);
    expect(errors).toHaveLength(0);
    expect(authorities).toEqual([
      expect.objectContaining({
        aishe_code: "U-0549",
        name: "Test University",
        active_covered: 42,
        status: "verified",
      }),
    ]);
    expect(deadlines).toEqual([
      expect.objectContaining({
        authority_code: "U-0549",
        event_type: "Mid-semester examination window begins",
        exact_date: "2026-09-12",
        status: "verified",
      }),
    ]);
  });
});

describe("parseServicePricesSheet", () => {
  it("parses price rows, allowing blank prices", () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Services & Pricing");
    sheet.addRow(["Service", "Unit", "Price Low", "Price High", "Note"]);
    sheet.addRow(["Editing", "per_word", 0.28, 0.45, null]);
    sheet.addRow(["Custom project", "per_project", null, null, "custom"]);

    const { rows } = parseServicePricesSheet(sheet);
    expect(rows).toEqual([
      { service: "Editing", unit: "per_word", price_low: 0.28, price_high: 0.45, note: null },
      {
        service: "Custom project",
        unit: "per_project",
        price_low: null,
        price_high: null,
        note: "custom",
      },
    ]);
  });
});
