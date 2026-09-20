import type { Metadata } from "next";
import { TimelineForm } from "./TimelineForm";

export const metadata: Metadata = {
  title: "Thesis Timeline Planner",
  description: "Work backwards from your submission date to every major milestone.",
};

export default function TimelineToolPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Thesis Timeline Planner</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Enter your submission date and degree level to see milestone dates, working backwards.
      </p>
      <TimelineForm />
      <p className="mt-8 text-sm text-zinc-500">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </div>
  );
}
