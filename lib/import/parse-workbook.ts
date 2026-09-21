import type { Worksheet } from "exceljs";
import { mapStatusText } from "./status-map";
import type { DeadlineStatus } from "@/lib/supabase/types";

export interface ValidationError {
  sheet: string;
  row: number;
  message: string;
}

export interface ParsedInstitutionRow {
  aishe_code: string;
  kind: string;
  name: string;
  state: string;
  district: string | null;
  address: string | null;
  website: string | null;
  inst_type: string | null;
  management: string | null;
  affiliating_code: string | null;
  affiliating_name: string | null;
  urban_rural: string | null;
  established: number | null;
  priority_rank: number | null;
  base_score: number | null;
  calendar_authority_code: string | null;
  status: DeadlineStatus;
  last_checked: string | null;
  geo_target: string | null;
  maps_url: string | null;
  inner_km: number | null;
  outer_km: number | null;
}

export interface ParsedAuthorityRow {
  aishe_code: string;
  name: string;
  state: string | null;
  active_covered: number | null;
  calendar_url: string | null;
  exam_url: string | null;
  notice_url: string | null;
  link_confidence: string | null;
  status: DeadlineStatus;
  last_checked: string | null;
  next_refresh: string | null;
  owner: string | null;
}

export interface ParsedDeadlineRow {
  authority_code: string;
  event_type: string;
  exact_date: string | null;
  status: DeadlineStatus;
  evidence_url: string | null;
}

export interface ParsedServicePriceRow {
  service: string;
  unit: string;
  price_low: number | null;
  price_high: number | null;
  note: string | null;
}

/**
 * Finds the header row by locating the cell that equals `firstHeader`
 * (BUILD_SPEC.md Section 4), rather than assuming a fixed row number -
 * title rows above it may be merged and vary in count.
 */
export function findHeaderRow(
  sheet: Worksheet,
  firstHeader: string,
  maxRowsToScan = 10,
): { headerRow: number; columns: Record<string, number> } | null {
  for (let rowNumber = 1; rowNumber <= maxRowsToScan; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    let matchColumn: number | null = null;
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (String(cell.value ?? "").trim() === firstHeader) {
        matchColumn = colNumber;
      }
    });
    if (matchColumn != null) {
      const columns: Record<string, number> = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const header = String(cell.value ?? "").trim();
        if (header) columns[header] = colNumber;
      });
      return { headerRow: rowNumber, columns };
    }
  }
  return null;
}

function cellText(sheet: Worksheet, row: number, col: number | undefined): string | null {
  if (!col) return null;
  const value = sheet.getRow(row).getCell(col).value;
  if (value == null) return null;
  if (typeof value === "object" && "text" in value) return String(value.text).trim() || null;
  const text = String(value).trim();
  return text === "" ? null : text;
}

function cellNumber(sheet: Worksheet, row: number, col: number | undefined): number | null {
  const text = cellText(sheet, row, col);
  if (text == null) return null;
  const value = Number(text);
  return Number.isNaN(value) ? null : value;
}

function cellDateIso(sheet: Worksheet, row: number, col: number | undefined): string | null {
  if (!col) return null;
  const value = sheet.getRow(row).getCell(col).value;
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  // Some exports carry dates as plain text like "16 Aug 2026".
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

const INSTITUTIONS_FIRST_HEADER = "AISHE Code";

export function parseInstitutionsSheet(sheet: Worksheet): {
  rows: ParsedInstitutionRow[];
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const header = findHeaderRow(sheet, INSTITUTIONS_FIRST_HEADER);
  if (!header) {
    return {
      rows: [],
      errors: [
        {
          sheet: sheet.name,
          row: 0,
          message: `Header row with "${INSTITUTIONS_FIRST_HEADER}" not found`,
        },
      ],
    };
  }

  const rows: ParsedInstitutionRow[] = [];
  const seenCodes = new Set<string>();
  const col = header.columns;

  for (let r = header.headerRow + 1; r <= sheet.rowCount; r++) {
    const aisheCode = cellText(sheet, r, col["AISHE Code"]);
    if (!aisheCode) continue; // blank row = end of data

    if (seenCodes.has(aisheCode)) {
      errors.push({ sheet: sheet.name, row: r, message: `Duplicate AISHE Code ${aisheCode}` });
      continue;
    }
    seenCodes.add(aisheCode);

    const statusText = cellText(sheet, r, col["Deadline Status"]);
    const status = mapStatusText(statusText);
    if (statusText && !status) {
      errors.push({ sheet: sheet.name, row: r, message: `Unknown status "${statusText}"` });
      continue;
    }

    const kind = cellText(sheet, r, col["Kind"]);
    const name = cellText(sheet, r, col["Institution"]);
    const state = cellText(sheet, r, col["State / UT"]);
    if (!kind || !name || !state) {
      errors.push({
        sheet: sheet.name,
        row: r,
        message: "Missing Kind, Institution or State / UT",
      });
      continue;
    }

    rows.push({
      aishe_code: aisheCode,
      kind,
      name,
      state,
      district: cellText(sheet, r, col["District"]),
      address: cellText(sheet, r, col["Address"]),
      website: cellText(sheet, r, col["Website"]),
      inst_type: cellText(sheet, r, col["Institution Type"]),
      management: cellText(sheet, r, col["Management"]),
      affiliating_code: cellText(sheet, r, col["Affiliating Univ. Code"]),
      affiliating_name: cellText(sheet, r, col["Affiliating University"]),
      urban_rural: cellText(sheet, r, col["Urban / Rural"]),
      established: cellNumber(sheet, r, col["Established"]),
      priority_rank: cellNumber(sheet, r, col["Priority Rank"]),
      base_score: cellNumber(sheet, r, col["Base Opportunity Score"]),
      calendar_authority_code: cellText(sheet, r, col["Calendar Authority Code"]),
      status: status ?? "manual_required",
      last_checked: cellDateIso(sheet, r, col["Last Checked"]),
      geo_target: cellText(sheet, r, col["Geo Target"]),
      maps_url: cellText(sheet, r, col["Google Maps Search"]),
      inner_km: cellNumber(sheet, r, col["Inner Radius km"]),
      outer_km: cellNumber(sheet, r, col["Outer Radius km"]),
    });
  }

  return { rows, errors };
}

const AUTHORITIES_FIRST_HEADER = "Authority AISHE Code";

export function parseAuthoritiesSheet(sheet: Worksheet): {
  authorities: ParsedAuthorityRow[];
  deadlines: ParsedDeadlineRow[];
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const header = findHeaderRow(sheet, AUTHORITIES_FIRST_HEADER);
  if (!header) {
    return {
      authorities: [],
      deadlines: [],
      errors: [
        {
          sheet: sheet.name,
          row: 0,
          message: `Header row with "${AUTHORITIES_FIRST_HEADER}" not found`,
        },
      ],
    };
  }

  const authorities: ParsedAuthorityRow[] = [];
  const deadlines: ParsedDeadlineRow[] = [];
  const col = header.columns;

  for (let r = header.headerRow + 1; r <= sheet.rowCount; r++) {
    const aisheCode = cellText(sheet, r, col["Authority AISHE Code"]);
    if (!aisheCode) continue;

    const name = cellText(sheet, r, col["Calendar Authority"]);
    if (!name) {
      errors.push({ sheet: sheet.name, row: r, message: "Missing Calendar Authority name" });
      continue;
    }

    const statusText = cellText(sheet, r, col["Deadline Status"]);
    const status = mapStatusText(statusText);
    if (statusText && !status) {
      errors.push({ sheet: sheet.name, row: r, message: `Unknown status "${statusText}"` });
      continue;
    }

    authorities.push({
      aishe_code: aisheCode,
      name,
      state: cellText(sheet, r, col["State"]),
      active_covered: cellNumber(sheet, r, col["Active 8K Covered"]),
      calendar_url: cellText(sheet, r, col["Academic Calendar URL"]),
      exam_url: cellText(sheet, r, col["Exam / Notice URL"]),
      notice_url: cellText(sheet, r, col["Exam / Notice URL"]),
      link_confidence: cellText(sheet, r, col["Link Confidence"]),
      status: status ?? "manual_required",
      last_checked: cellDateIso(sheet, r, col["Last Checked"]),
      next_refresh: cellText(sheet, r, col["Next Refresh"]),
      owner: cellText(sheet, r, col["Owner"]),
    });

    const eventType = cellText(sheet, r, col["Deadline / Submission Type"]);
    const exactDate = cellDateIso(sheet, r, col["Exact Date"]);
    if (eventType && status) {
      deadlines.push({
        authority_code: aisheCode,
        event_type: eventType,
        exact_date: exactDate,
        status,
        evidence_url: cellText(sheet, r, col["Evidence URL"]),
      });
    }
  }

  return { authorities, deadlines, errors };
}

const SERVICE_PRICES_FIRST_HEADER = "Service";

export function parseServicePricesSheet(sheet: Worksheet): {
  rows: ParsedServicePriceRow[];
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const header = findHeaderRow(sheet, SERVICE_PRICES_FIRST_HEADER);
  if (!header) {
    return {
      rows: [],
      errors: [
        {
          sheet: sheet.name,
          row: 0,
          message: `Header row with "${SERVICE_PRICES_FIRST_HEADER}" not found`,
        },
      ],
    };
  }

  const rows: ParsedServicePriceRow[] = [];
  const col = header.columns;

  for (let r = header.headerRow + 1; r <= sheet.rowCount; r++) {
    const service = cellText(sheet, r, col["Service"]);
    if (!service) continue;

    rows.push({
      service,
      unit: cellText(sheet, r, col["Unit"]) ?? "per_project",
      price_low: cellNumber(sheet, r, col["Price Low"]),
      price_high: cellNumber(sheet, r, col["Price High"]),
      note: cellText(sheet, r, col["Note"]),
    });
  }

  return { rows, errors };
}
