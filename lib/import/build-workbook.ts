import ExcelJS from "exceljs";
import type { Database } from "@/lib/supabase/types";

type Institution = Database["public"]["Tables"]["institutions"]["Row"];
type Authority = Database["public"]["Tables"]["authorities"]["Row"];

const INSTITUTIONS_HEADERS = [
  "Priority Rank",
  "AISHE Code",
  "Kind",
  "Institution",
  "State / UT",
  "District",
  "Address",
  "Website",
  "Institution Type",
  "Management",
  "Affiliating Univ. Code",
  "Affiliating University",
  "Urban / Rural",
  "Established",
  "Base Opportunity Score",
  "Deadline Status",
  "Last Checked",
];

const AUTHORITIES_HEADERS = [
  "Authority AISHE Code",
  "Calendar Authority",
  "State",
  "Active 8K Covered",
  "Academic Calendar URL",
  "Exam / Notice URL",
  "Link Confidence",
  "Deadline Status",
  "Last Checked",
  "Next Refresh",
  "Owner",
];

/** Writes live data back in the same sheet names and header layout the import reads, so a re-import shows zero diff. */
export function buildExportWorkbook(
  institutions: Institution[],
  authorities: Authority[],
): ExcelJS.Workbook {
  const workbook = new ExcelJS.Workbook();

  const institutionsSheet = workbook.addWorksheet("Active 8K Intelligence");
  institutionsSheet.addRow(INSTITUTIONS_HEADERS);
  for (const inst of institutions) {
    institutionsSheet.addRow([
      inst.priority_rank,
      inst.aishe_code,
      inst.kind,
      inst.name,
      inst.state,
      inst.district,
      inst.address,
      inst.website,
      inst.inst_type,
      inst.management,
      inst.affiliating_code,
      inst.affiliating_name,
      inst.urban_rural,
      inst.established,
      inst.base_score,
      inst.status,
      inst.last_checked,
    ]);
  }

  const authoritiesSheet = workbook.addWorksheet("Deadline Tracker");
  authoritiesSheet.addRow(AUTHORITIES_HEADERS);
  for (const authority of authorities) {
    authoritiesSheet.addRow([
      authority.aishe_code,
      authority.name,
      authority.state,
      authority.active_covered,
      authority.calendar_url,
      authority.exam_url,
      authority.link_confidence,
      authority.status,
      authority.last_checked,
      authority.next_refresh,
      authority.owner,
    ]);
  }

  return workbook;
}

export function institutionsToCsv(institutions: Institution[]): string {
  const headers = ["aishe_code", "name", "state", "district", "kind", "status", "last_checked"];
  const lines = [headers.join(",")];
  for (const inst of institutions) {
    lines.push(
      headers
        .map((h) => csvEscape(String((inst as unknown as Record<string, unknown>)[h] ?? "")))
        .join(","),
    );
  }
  return lines.join("\n");
}

/** Geo-target export (Phase 6, admin-only) in the layout of the source
 * workbook's "Geo Targeting" sheet, for pasting into ad platform tools. */
export function geoTargetingToCsv(institutions: Institution[]): string {
  const headers = ["aishe_code", "name", "geo_target", "maps_url", "inner_km", "outer_km"];
  const lines = [headers.join(",")];
  for (const inst of institutions.filter((i) => i.geo_target)) {
    lines.push(
      headers
        .map((h) => csvEscape(String((inst as unknown as Record<string, unknown>)[h] ?? "")))
        .join(","),
    );
  }
  return lines.join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
