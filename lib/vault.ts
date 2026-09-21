export interface VaultDocument {
  id: string;
  path: string;
  sha256: string | null;
  uploaded_at: string;
  version_label: string | null;
}

export interface VaultTimelineEntry {
  id: string;
  version: number;
  label: string;
  filename: string;
  sha256: string | null;
  uploadedAt: string;
}

/** Orders a project's uploads oldest-first and numbers them as versions. */
export function buildVaultTimeline(documents: VaultDocument[]): VaultTimelineEntry[] {
  const ordered = [...documents].sort(
    (a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime(),
  );
  return ordered.map((doc, index) => ({
    id: doc.id,
    version: index + 1,
    label: doc.version_label?.trim() || `Version ${index + 1}`,
    filename: doc.path.split("/").pop() ?? doc.path,
    sha256: doc.sha256,
    uploadedAt: doc.uploaded_at,
  }));
}

export const AUTHORSHIP_REPORT_DISCLAIMER =
  "This report is supporting evidence of when each version was uploaded and its file " +
  "hash. It is not proof of originality or a promised result, and is not a substitute " +
  "for your institution's own review.";

/** Plain-text lines for the Authorship Evidence Report - fed to the PDF renderer. */
export function buildAuthorshipReportLines(
  projectTitle: string,
  ownerName: string,
  timeline: VaultTimelineEntry[],
): string[] {
  const lines = [
    "Authorship Evidence Report",
    `Project: ${projectTitle}`,
    `Prepared for: ${ownerName}`,
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    "",
    AUTHORSHIP_REPORT_DISCLAIMER,
    "",
    `Versions on file: ${timeline.length}`,
    "",
  ];
  for (const entry of timeline) {
    lines.push(`${entry.version}. ${entry.label}`);
    lines.push(`   File: ${entry.filename}`);
    lines.push(`   Uploaded: ${new Date(entry.uploadedAt).toISOString()}`);
    lines.push(`   SHA-256: ${entry.sha256 ?? "not recorded"}`);
    lines.push("");
  }
  return lines;
}
