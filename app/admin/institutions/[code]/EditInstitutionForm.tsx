"use client";

import { useState } from "react";
import { updateInstitution } from "./actions";
import type { Database } from "@/lib/supabase/types";

type Institution = Database["public"]["Tables"]["institutions"]["Row"];

const STATUSES = [
  "verified",
  "link_found",
  "proxy",
  "seasonality_only",
  "manual_required",
] as const;

export function EditInstitutionForm({
  institution,
  canEdit,
}: {
  institution: Institution;
  canEdit: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    const result = await updateInstitution(institution.aishe_code, formData);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
    }
  }

  return (
    <form action={action} className="mt-6 flex flex-col gap-3">
      {(
        [
          ["name", "Name"],
          ["state", "State"],
          ["district", "District"],
          ["address", "Address"],
          ["website", "Website"],
          ["inst_type", "Institution type"],
          ["management", "Management"],
          ["affiliating_code", "Affiliating code"],
          ["affiliating_name", "Affiliating university"],
          ["urban_rural", "Urban / Rural"],
        ] as const
      ).map(([field, label]) => (
        <label key={field} className="flex flex-col gap-1 text-sm">
          {label}
          <input
            name={field}
            defaultValue={institution[field] ?? ""}
            disabled={!canEdit}
            className="rounded border border-zinc-300 px-3 py-2 disabled:opacity-60 dark:border-zinc-700"
          />
        </label>
      ))}
      <label className="flex flex-col gap-1 text-sm">
        Status
        <select
          name="status"
          defaultValue={institution.status}
          disabled={!canEdit}
          className="rounded border border-zinc-300 px-3 py-2 disabled:opacity-60 dark:border-zinc-700"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {canEdit ? (
        <button
          type="submit"
          className="mt-2 self-start rounded-full bg-zinc-900 px-6 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Save
        </button>
      ) : (
        <p className="text-xs text-zinc-500">Only admins can edit institutions.</p>
      )}
      {saved ? <p className="text-sm text-green-700 dark:text-green-400">Saved.</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
