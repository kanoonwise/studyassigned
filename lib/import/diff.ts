export interface ChangedRow<T> {
  key: string;
  before: T;
  after: T;
  changedFields: string[];
}

export interface DiffResult<T> {
  added: T[];
  changed: ChangedRow<T>[];
  removed: string[];
  unchangedCount: number;
}

/**
 * Generic new/changed/removed diff between a freshly-parsed sheet and the
 * live table, keyed by a natural key (e.g. aishe_code). Only the given
 * fields are compared - callers pass exactly the columns their sheet can
 * actually change.
 */
export function computeDiff<T>(
  staged: T[],
  current: T[],
  keyField: keyof T,
  compareFields: (keyof T)[],
): DiffResult<T> {
  const currentByKey = new Map(current.map((row) => [String(row[keyField]), row]));
  const stagedKeys = new Set(staged.map((row) => String(row[keyField])));

  const added: T[] = [];
  const changed: ChangedRow<T>[] = [];
  let unchangedCount = 0;

  for (const row of staged) {
    const key = String(row[keyField]);
    const existing = currentByKey.get(key);
    if (!existing) {
      added.push(row);
      continue;
    }
    const changedFields = compareFields.filter(
      (field) => !valuesEqual(existing[field], row[field]),
    );
    if (changedFields.length > 0) {
      changed.push({ key, before: existing, after: row, changedFields: changedFields as string[] });
    } else {
      unchangedCount++;
    }
  }

  const removed = current.map((row) => String(row[keyField])).filter((key) => !stagedKeys.has(key));

  return { added, changed, removed, unchangedCount };
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a == null && b == null) return true;
  return a === b;
}

export interface VerifiedConflict {
  authorityCode: string;
  eventType: string;
  currentDate: string | null;
  incomingDate: string | null;
}

/**
 * A workbook row marking something `verified` must never silently
 * overwrite a different date a verifier already confirmed in the
 * dashboard (BUILD_SPEC.md Section 4) - flag it instead.
 */
export function findVerifiedConflicts<
  T extends {
    authority_code: string;
    event_type: string;
    status: string;
    exact_date: string | null;
  },
>(staged: T[], current: T[]): VerifiedConflict[] {
  const currentVerified = new Map(
    current
      .filter((row) => row.status === "verified")
      .map((row) => [`${row.authority_code}::${row.event_type}`, row]),
  );

  const conflicts: VerifiedConflict[] = [];
  for (const row of staged) {
    if (row.status !== "verified") continue;
    const existing = currentVerified.get(`${row.authority_code}::${row.event_type}`);
    if (existing && existing.exact_date !== row.exact_date) {
      conflicts.push({
        authorityCode: row.authority_code,
        eventType: row.event_type,
        currentDate: existing.exact_date,
        incomingDate: row.exact_date,
      });
    }
  }
  return conflicts;
}
