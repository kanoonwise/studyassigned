import type { Metadata } from "next";
import { DisclosureForm } from "./DisclosureForm";

export const metadata: Metadata = {
  title: "AI-Use Disclosure Generator",
  description: "Generate a ready statement describing how you used AI tools in your work.",
};

export default function DisclosureToolPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">AI-Use Disclosure Generator</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Generates a ready statement. Always check your institution&apos;s own AI-use policy for what
        and how you need to disclose.
      </p>
      <DisclosureForm />
    </div>
  );
}
