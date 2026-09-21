import { createClient } from "@/lib/supabase/server";
import { buildForecastComparison } from "@/lib/forecast";
import { ChecklistRow } from "./ChecklistRow";
import { MetricForm } from "./MetricForm";
import { AddChecklistForm } from "./AddChecklistForm";

export default async function AdminForecastPage() {
  const supabase = await createClient();
  const [{ data: actuals }, { data: forecasts }, { data: checklist }] = await Promise.all([
    supabase.from("admin_actuals").select("month, metric, value"),
    supabase.from("admin_forecasts").select("month, metric, value"),
    supabase
      .from("campaign_checklist_items")
      .select("id, month, item, done")
      .order("month", { ascending: false }),
  ]);

  const comparison = buildForecastComparison(actuals ?? [], forecasts ?? []);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-xl font-semibold">Actual vs forecast</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Admin-only. Nothing here is ever shown on the public site or to students.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
                <th className="py-2 pr-4">Month</th>
                <th className="py-2 pr-4">Metric</th>
                <th className="py-2 pr-4">Actual</th>
                <th className="py-2 pr-4">Forecast</th>
                <th className="py-2 pr-4">Variance</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr
                  key={`${row.month}-${row.metric}`}
                  className="border-b border-zinc-100 dark:border-zinc-900"
                >
                  <td className="py-2 pr-4">{row.month}</td>
                  <td className="py-2 pr-4">{row.metric}</td>
                  <td className="py-2 pr-4">{row.actual ?? "-"}</td>
                  <td className="py-2 pr-4">{row.forecast ?? "-"}</td>
                  <td className="py-2 pr-4">
                    {row.variance != null ? (
                      <span className={row.variance >= 0 ? "text-emerald-700" : "text-red-700"}>
                        {row.variance >= 0 ? "+" : ""}
                        {row.variance} ({row.variancePct?.toFixed(1)}%)
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {comparison.length === 0 ? (
            <p className="py-4 text-sm text-zinc-500">
              No data yet. Add a month/metric/value below for actuals and forecasts.
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <MetricForm kind="actual" />
          <MetricForm kind="forecast" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Monthly campaign checklist</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {checklist?.map((item) => (
            <ChecklistRow key={item.id} item={item} />
          ))}
        </ul>
        {!checklist || checklist.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No checklist items yet.</p>
        ) : null}
        <AddChecklistForm />
      </div>
    </div>
  );
}
