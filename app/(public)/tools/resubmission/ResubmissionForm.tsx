"use client";

import { useState } from "react";
import { calculateResubmission, type ResubmissionResult } from "@/lib/tools/resubmission";
import { logToolEvent } from "@/lib/tools-log-client";
import { EmailResultOptIn } from "@/components/tools/EmailResultOptIn";

interface LevelOption {
  level: number;
  label: string;
  action_window_months: number | null;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "long" });

export function ResubmissionForm({ levels }: { levels: LevelOption[] }) {
  const [reportDate, setReportDate] = useState("");
  const [levelValue, setLevelValue] = useState(String(levels[0]?.level ?? ""));
  const [result, setResult] = useState<ResubmissionResult | null>(null);
  const [noWindow, setNoWindow] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!reportDate) return;
    const level = levels.find((l) => String(l.level) === levelValue);
    if (!level) return;

    const computed = calculateResubmission(new Date(reportDate), level.action_window_months);
    setResult(computed);
    setNoWindow(computed === null);
    if (computed) {
      logToolEvent("resubmission", { reportDate, level: level.level });
    }
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Report date
          <input
            type="date"
            required
            value={reportDate}
            onChange={(event) => setReportDate(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Level
          <select
            value={levelValue}
            onChange={(event) => setLevelValue(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          >
            {levels.map((level) => (
              <option key={level.level} value={level.level}>
                {level.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Calculate
        </button>
      </form>

      {noWindow ? (
        <p className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          No resubmission window applies at this level. See our free UGC Similarity Level Calculator
          for what typically happens instead.
        </p>
      ) : null}

      {result ? (
        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h2 className="font-semibold">
            Last resubmission date: {dateFormatter.format(result.lastResubmissionDate)}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {result.daysLeft >= 0
              ? `${result.daysLeft} day${result.daysLeft === 1 ? "" : "s"} left.`
              : "This date has passed."}
          </p>
          <ol className="mt-2 flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            {result.plan.map((week) => (
              <li key={week.week}>
                Week {week.week}: {week.task}
              </li>
            ))}
          </ol>
          <div className="pt-2">
            <EmailResultOptIn tool="resubmission" inputs={{ reportDate, level: levelValue }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
