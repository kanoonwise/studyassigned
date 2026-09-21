export interface MetricRow {
  month: string;
  metric: string;
  value: number;
}

export interface ForecastComparisonRow {
  month: string;
  metric: string;
  actual: number | null;
  forecast: number | null;
  variance: number | null;
  variancePct: number | null;
}

/** Plan vs actual by month and metric - a null on either side means no row was imported yet. */
export function buildForecastComparison(
  actuals: MetricRow[],
  forecasts: MetricRow[],
): ForecastComparisonRow[] {
  const key = (r: { month: string; metric: string }) => `${r.month}::${r.metric}`;
  const actualByKey = new Map(actuals.map((a) => [key(a), a.value]));
  const forecastByKey = new Map(forecasts.map((f) => [key(f), f.value]));
  const allKeys = new Set([...actualByKey.keys(), ...forecastByKey.keys()]);

  const rows: ForecastComparisonRow[] = [];
  for (const k of allKeys) {
    const [month, metric] = k.split("::");
    const actual = actualByKey.get(k) ?? null;
    const forecast = forecastByKey.get(k) ?? null;
    const variance = actual != null && forecast != null ? actual - forecast : null;
    const variancePct = variance != null && forecast ? (variance / forecast) * 100 : null;
    rows.push({ month, metric, actual, forecast, variance, variancePct });
  }

  return rows.sort((a, b) => a.month.localeCompare(b.month) || a.metric.localeCompare(b.metric));
}
