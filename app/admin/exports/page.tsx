export default function AdminExportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Exports</h1>

      <div>
        <h2 className="font-medium">Full workbook export</h2>
        <p className="text-sm text-zinc-500">
          Institutions and authorities, in the same sheet names and header layout the import reads -
          re-importing this file should show zero diff.
        </p>
        <a
          href="/api/admin/export"
          className="mt-2 inline-block rounded-full bg-zinc-900 px-6 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Download .xlsx
        </a>
      </div>

      <div>
        <h2 className="font-medium">Filtered CSV (institutions)</h2>
        <form
          className="mt-2 flex flex-wrap gap-2 text-sm"
          action="/api/admin/export/csv"
          method="get"
        >
          <input
            name="state"
            placeholder="State"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
          <select
            name="status"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          >
            <option value="">All statuses</option>
            <option value="verified">verified</option>
            <option value="link_found">link_found</option>
            <option value="proxy">proxy</option>
            <option value="seasonality_only">seasonality_only</option>
            <option value="manual_required">manual_required</option>
          </select>
          <button
            type="submit"
            className="rounded-full border border-zinc-300 px-4 py-2 dark:border-zinc-700"
          >
            Download .csv
          </button>
        </form>
      </div>
    </div>
  );
}
