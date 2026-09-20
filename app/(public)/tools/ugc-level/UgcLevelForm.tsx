"use client";

import { useState } from "react";
import { calculateUgcLevel, type UgcLevelConfig, type UgcLevelResult } from "@/lib/tools/ugc-level";
import { logToolEvent } from "@/lib/tools-log-client";
import { EmailResultOptIn } from "@/components/tools/EmailResultOptIn";

export function UgcLevelForm({ levels }: { levels: UgcLevelConfig[] }) {
  const [similarity, setSimilarity] = useState("");
  const [excluded, setExcluded] = useState(false);
  const [result, setResult] = useState<UgcLevelResult | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = Number(similarity);
    if (Number.isNaN(value) || value < 0 || value > 100) return;

    const computed = calculateUgcLevel(value, excluded, levels);
    setResult(computed);
    if (computed) {
      logToolEvent("ugc-level", { similarity: value, excluded, level: computed.match.level });
    }
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Similarity percentage
          <input
            type="number"
            min={0}
            max={100}
            step="0.1"
            required
            value={similarity}
            onChange={(event) => setSimilarity(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={excluded}
            onChange={(event) => setExcluded(event.target.checked)}
            className="mt-1"
          />
          <span>References, quotes and other exclusions are already excluded from this figure</span>
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Calculate
        </button>
      </form>

      {result ? (
        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">{result.match.label}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{result.match.consequence}</p>
          {result.match.action_window_months ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              If a resubmission window applies, it is typically up to{" "}
              {result.match.action_window_months} months. See the Resubmission Deadline Calculator
              for a plan.
            </p>
          ) : null}
          {result.exclusionNote ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">{result.exclusionNote}</p>
          ) : null}
          <div className="pt-2">
            <EmailResultOptIn
              tool="ugc-level"
              inputs={{ similarity: Number(similarity), excluded, level: result.match.level }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
