"use client";

import { useState } from "react";
import { generateAppealLetter } from "@/lib/tools/appeal-letter";
import { logToolEvent } from "@/lib/tools-log-client";
import { EmailResultOptIn } from "@/components/tools/EmailResultOptIn";

export function AppealKitForm() {
  const [studentName, setStudentName] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [panelName, setPanelName] = useState("");
  const [decisionSummary, setDecisionSummary] = useState("");
  const [grounds, setGrounds] = useState("");
  const [evidence, setEvidence] = useState("");
  const [letter, setLetter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const inputs = {
      studentName,
      institutionName,
      panelName,
      decisionSummary,
      grounds: grounds
        .split("\n")
        .map((g) => g.trim())
        .filter(Boolean),
      evidence: evidence
        .split("\n")
        .map((e) => e.trim())
        .filter(Boolean),
    };
    const generated = generateAppealLetter(inputs);
    setLetter(generated);
    setCopied(false);
    logToolEvent("appeal-letter", inputs);
  }

  async function copy() {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    setCopied(true);
  }

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-sm">
        <label className="flex flex-col gap-1">
          Your name
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          Institution
          <input
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          Appeal panel or committee name
          <input
            value={panelName}
            onChange={(e) => setPanelName(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          Summary of the decision being appealed
          <textarea
            value={decisionSummary}
            onChange={(e) => setDecisionSummary(e.target.value)}
            rows={2}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          Grounds for appeal (one per line)
          <textarea
            value={grounds}
            onChange={(e) => setGrounds(e.target.value)}
            rows={3}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <label className="flex flex-col gap-1">
          Evidence (one per line)
          <textarea
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            rows={3}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700"
          />
        </label>
        <button
          type="submit"
          className="self-start rounded-full bg-zinc-900 px-6 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Draft letter
        </button>
      </form>

      {letter ? (
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <pre className="font-sans text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
            {letter}
          </pre>
          <button
            type="button"
            onClick={copy}
            className="self-start rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          <EmailResultOptIn tool="appeal-letter" inputs={{ studentName, institutionName }} />
        </div>
      ) : null}
    </div>
  );
}
