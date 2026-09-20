import type { Metadata } from "next";
import { APPEAL_EVIDENCE_CHECKLIST } from "@/lib/tools/appeal-letter";
import { AppealKitForm } from "./AppealKitForm";

export const metadata: Metadata = {
  title: "AI-Flag Appeal Kit",
  description:
    "An evidence checklist and appeal letter starting draft for an AI-generated content flag.",
};

export default function AppealKitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">AI-Flag Appeal Kit</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        If your work has been flagged as AI-generated and you believe that&apos;s wrong, this helps
        you gather evidence and draft an appeal. It&apos;s a starting point, not legal advice.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Evidence checklist</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          {APPEAL_EVIDENCE_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Draft your appeal letter</h2>
        <AppealKitForm />
      </section>

      <p className="mt-8 rounded-lg border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        Want a lawyer to review your appeal before you submit it? That&apos;s available as a paid
        add-on -{" "}
        <a href="/contact" className="underline-offset-4 hover:underline">
          get in touch
        </a>
        .
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </div>
  );
}
