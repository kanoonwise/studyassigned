import type { Metadata } from "next";
import { Search } from "lucide-react";
import { UniversitySearch } from "@/components/UniversitySearch";

export const metadata: Metadata = {
  title: "Find Your Institution",
  description: "Search for your college or university to see its verified deadlines.",
};

export default function UniversitiesPage() {
  return (
    <div className="hero-glow min-h-[70vh]">
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <span className="bg-primary-soft text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
          <Search className="h-6 w-6" strokeWidth={2} />
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Find your institution</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Search by name, state or district to see what we&apos;ve verified from official sources.
        </p>
        <div className="mt-8 text-left">
          <UniversitySearch />
        </div>
        <p className="mt-8 text-sm text-zinc-500">
          Informational only. Your institution&apos;s own rules and official notices apply.
        </p>
      </div>
    </div>
  );
}
