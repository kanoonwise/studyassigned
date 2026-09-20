"use client";

import { useState } from "react";
import ExcelJS from "exceljs";
import {
  parseInstitutionsSheet,
  parseAuthoritiesSheet,
  parseServicePricesSheet,
  type ValidationError,
} from "@/lib/import/parse-workbook";
import { stageAndDiff, approveBatch, type DiffSummary, type StagedWorkbook } from "./actions";

type Step = "idle" | "parsing" | "reviewing" | "approving" | "done" | "error";

export function ImportUploader() {
  const [step, setStep] = useState<Step>("idle");
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [summary, setSummary] = useState<DiffSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStep("parsing");
    setMessage(null);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());

    const institutionsSheet = workbook.getWorksheet("Active 8K Intelligence");
    const authoritiesSheet = workbook.getWorksheet("Deadline Tracker");
    const pricesSheet = workbook.getWorksheet("Services & Pricing");

    const allErrors: ValidationError[] = [];
    if (!institutionsSheet)
      allErrors.push({
        sheet: "workbook",
        row: 0,
        message: "Missing 'Active 8K Intelligence' sheet",
      });
    if (!authoritiesSheet)
      allErrors.push({ sheet: "workbook", row: 0, message: "Missing 'Deadline Tracker' sheet" });

    if (allErrors.length > 0) {
      setErrors(allErrors);
      setStep("error");
      return;
    }

    const institutions = parseInstitutionsSheet(institutionsSheet!);
    const authorities = parseAuthoritiesSheet(authoritiesSheet!);
    const prices = pricesSheet ? parseServicePricesSheet(pricesSheet) : { rows: [], errors: [] };

    const parseErrors = [...institutions.errors, ...authorities.errors, ...prices.errors];
    if (parseErrors.length > 0) {
      setErrors(parseErrors);
      setStep("error");
      return;
    }

    const data: StagedWorkbook = {
      institutions: institutions.rows,
      authorities: authorities.authorities,
      deadlines: authorities.deadlines,
      servicePrices: prices.rows,
    };

    const result = await stageAndDiff(file.name, data);
    if (!result.ok) {
      setMessage(result.error);
      setStep("error");
      return;
    }
    setSummary(result.summary);
    setStep("reviewing");
  }

  async function handleApprove() {
    if (!summary) return;
    setStep("approving");
    const result = await approveBatch(summary.batchId);
    if (result.error) {
      setMessage(result.error);
      setStep("error");
      return;
    }
    setStep("done");
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Workbook (.xlsx)
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFile}
          disabled={step === "parsing" || step === "approving"}
        />
      </label>

      {step === "parsing" ? (
        <p className="text-sm text-zinc-500">Parsing in your browser…</p>
      ) : null}

      {step === "error" ? (
        <div className="rounded-lg border border-red-200 p-4 text-sm dark:border-red-900">
          {message ? <p className="text-red-700 dark:text-red-400">{message}</p> : null}
          <ul className="mt-2 list-disc pl-5">
            {errors.map((e, i) => (
              <li key={i}>
                {e.sheet}
                {e.row ? ` row ${e.row}` : ""}: {e.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === "reviewing" && summary ? (
        <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
          <h2 className="font-semibold">Diff summary</h2>
          {(["institutions", "authorities", "servicePrices"] as const).map((sheet) => (
            <p key={sheet}>
              <span className="font-medium">{sheet}:</span> {summary[sheet].added} new,{" "}
              {summary[sheet].changed} changed, {summary[sheet].removed} removed
            </p>
          ))}
          {summary.conflicts.length > 0 ? (
            <div className="rounded border border-amber-300 p-3 dark:border-amber-800">
              <p className="font-medium text-amber-800 dark:text-amber-400">
                {summary.conflicts.length} verified-date conflict(s) - not applied automatically:
              </p>
              <ul className="mt-1 list-disc pl-5">
                {summary.conflicts.map((c, i) => (
                  <li key={i}>
                    {c.authorityCode} / {c.eventType}: dashboard has {c.currentDate}, workbook has{" "}
                    {c.incomingDate}. Resolve manually via Verification.
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <button
            type="button"
            onClick={handleApprove}
            className="self-start rounded-full bg-zinc-900 px-6 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Approve and apply
          </button>
        </div>
      ) : null}

      {step === "approving" ? <p className="text-sm text-zinc-500">Applying changes…</p> : null}
      {step === "done" ? (
        <p className="text-sm text-green-700 dark:text-green-400">Import applied.</p>
      ) : null}
    </div>
  );
}
