import type { Metadata } from "next";
import { UniversitySearch } from "@/components/UniversitySearch";

export const metadata: Metadata = {
  title: "Find Your Institution",
  description: "Search for your college or university to see its verified deadlines.",
};

export default function UniversitiesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Find your institution</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Search by name, state or district to see what we&apos;ve verified from official sources.
      </p>
      <div className="mt-8">
        <UniversitySearch />
      </div>
      <p className="mt-8 text-sm text-zinc-500">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </div>
  );
}
