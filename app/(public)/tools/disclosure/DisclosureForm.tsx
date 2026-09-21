"use client";

import { useState } from "react";
import { generateDisclosureStatement } from "@/lib/tools/disclosure";
import { logToolEvent } from "@/lib/tools-log-client";
import { EmailResultOptIn } from "@/components/tools/EmailResultOptIn";

export function DisclosureForm() {
  const [toolsUsed, setToolsUsed] = useState("");
  const [purpose, setPurpose] = useState("");
  const [sections, setSections] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statement, setStatement] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!fromDate || !toDate) return;

    const inputs = {
      toolsUsed: toolsUsed
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      purpose,
      sections: sections
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    };
    const generated = generateDisclosureStatement(inputs);
    setStatement(generated);
    setCopied(false);
    logToolEvent("disclosure", { ...inputs, fromDate, toDate });
  }

  async function copy() {
    if (!statement) return;
    await navigator.clipboard.writeText(statement);
    setCopied(true);
  }

  return (
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          AI tools used (comma-separated)
          <input
            value={toolsUsed}
            onChange={(event) => setToolsUsed(event.target.value)}
            placeholder="ChatGPT, Grammarly"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Purpose
          <input
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            placeholder="Checking grammar and sentence structure"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sections affected (comma-separated)
          <input
            value={sections}
            onChange={(event) => setSections(event.target.value)}
            placeholder="Introduction, Discussion"
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            From
            <input
              type="date"
              required
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            To
            <input
              type="date"
              required
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Generate statement
        </button>
      </form>

      {statement ? (
        <div className="mt-8 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <pre className="font-sans text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {statement}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="self-start rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          <div className="pt-2">
            <EmailResultOptIn
              tool="disclosure"
              inputs={{ toolsUsed, purpose, sections, fromDate, toDate }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
