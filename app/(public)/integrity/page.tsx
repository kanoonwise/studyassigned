import type { Metadata } from "next";
import { integrity } from "@/content/integrity";

export const metadata: Metadata = {
  title: "Integrity Policy",
  description: integrity.intro,
};

export default function IntegrityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{integrity.title}</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">{integrity.intro}</p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{integrity.wontDo.title}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          {integrity.wontDo.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{integrity.willDo.title}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-600 dark:text-zinc-400">
          {integrity.willDo.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Why we draw the line here</h2>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{integrity.why}</p>
      </section>
    </div>
  );
}
