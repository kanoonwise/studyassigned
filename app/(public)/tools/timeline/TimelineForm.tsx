"use client";

import { useState } from "react";
import { calculateTimeline, type DegreeLevel, type TimelineMilestone } from "@/lib/tools/timeline";
import { buildTimelineIcs } from "@/lib/tools/ics";
import { logToolEvent } from "@/lib/tools-log-client";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { dateStyle: "long" });

export function TimelineForm() {
  const [submissionDate, setSubmissionDate] = useState("");
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>("PG");
  const [milestones, setMilestones] = useState<TimelineMilestone[] | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!submissionDate) return;
    const computed = calculateTimeline(new Date(submissionDate), degreeLevel);
    setMilestones(computed);
    logToolEvent("timeline", { submissionDate, degreeLevel });
  }

  function downloadIcs() {
    if (!milestones) return;
    const ics = buildTimelineIcs(milestones, `Thesis timeline (${degreeLevel})`);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thesis-timeline.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Submission date
          <input
            type="date"
            required
            value={submissionDate}
            onChange={(event) => setSubmissionDate(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Degree level
          <select
            value={degreeLevel}
            onChange={(event) => setDegreeLevel(event.target.value as DegreeLevel)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          >
            <option value="UG">Undergraduate</option>
            <option value="PG">Postgraduate</option>
            <option value="PhD">PhD</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Build timeline
        </button>
      </form>

      {milestones ? (
        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <ol className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
            {milestones.map((milestone) => (
              <li key={milestone.key} className="flex justify-between gap-4">
                <span>{milestone.label}</span>
                <span className="whitespace-nowrap">{dateFormatter.format(milestone.date)}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={downloadIcs}
            className="mt-2 self-start rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Download as calendar (.ics)
          </button>
        </div>
      ) : null}
    </div>
  );
}
