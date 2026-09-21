import { describe, expect, it } from "vitest";
import { buildForecastComparison } from "@/lib/forecast";

describe("buildForecastComparison", () => {
  it("pairs actuals and forecasts by month and metric", () => {
    const rows = buildForecastComparison(
      [{ month: "2026-01-01", metric: "leads", value: 120 }],
      [{ month: "2026-01-01", metric: "leads", value: 100 }],
    );
    expect(rows).toEqual([
      {
        month: "2026-01-01",
        metric: "leads",
        actual: 120,
        forecast: 100,
        variance: 20,
        variancePct: 20,
      },
    ]);
  });

  it("leaves the missing side null instead of assuming zero", () => {
    const rows = buildForecastComparison(
      [{ month: "2026-01-01", metric: "leads", value: 120 }],
      [],
    );
    expect(rows).toEqual([
      {
        month: "2026-01-01",
        metric: "leads",
        actual: 120,
        forecast: null,
        variance: null,
        variancePct: null,
      },
    ]);
  });

  it("sorts by month then metric", () => {
    const rows = buildForecastComparison(
      [
        { month: "2026-02-01", metric: "orders", value: 5 },
        { month: "2026-01-01", metric: "revenue", value: 1000 },
        { month: "2026-01-01", metric: "leads", value: 50 },
      ],
      [],
    );
    expect(rows.map((r) => `${r.month}:${r.metric}`)).toEqual([
      "2026-01-01:leads",
      "2026-01-01:revenue",
      "2026-02-01:orders",
    ]);
  });
});
