export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024; // 20 MB

/** Default retention (BUILD_SPEC.md Section 9.9 leaves the real number open). */
export const DEFAULT_RETENTION_DAYS = 90;

export function isAllowedDocumentType(type: string): boolean {
  return (ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(type);
}

export function computeDeleteAfter(
  uploadedAt: Date,
  retentionDays: number = DEFAULT_RETENTION_DAYS,
): string {
  const result = new Date(uploadedAt);
  result.setDate(result.getDate() + retentionDays);
  return result.toISOString().slice(0, 10);
}
