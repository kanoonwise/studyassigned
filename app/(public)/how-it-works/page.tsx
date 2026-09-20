import type { Metadata } from "next";
import { howItWorks } from "@/content/how-it-works";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How an enquiry becomes editing, mentoring or report explanation support.",
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{howItWorks.title}</h1>
      <ol className="mt-10 flex flex-col gap-8">
        {howItWorks.steps.map((step) => (
          <li key={step.title}>
            <h2 className="font-medium">{step.title}</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
