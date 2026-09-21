import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { FOOTER_NAV } from "@/content/nav";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-zinc-600 sm:px-6 dark:text-zinc-400">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg">
              <GraduationCap className="h-4 w-4" strokeWidth={2.25} />
            </span>
            {process.env.NEXT_PUBLIC_SITE_NAME ?? "StudyAssigned"}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-primary dark:hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
          &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME ?? "StudyAssigned"}.
          Informational only. Your institution&apos;s own rules and official notices apply.
        </p>
      </div>
    </footer>
  );
}
