import type { Metadata } from "next";
import { faqs } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about what we do and don't do.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h1>
      <dl className="mt-10 flex flex-col gap-8">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <dt className="font-medium">{faq.question}</dt>
            <dd className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
