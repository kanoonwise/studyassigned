export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">
        {process.env.NEXT_PUBLIC_SITE_NAME ?? "StudyAssigned"}
      </h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Report explanation, deadline guidance and editing support for students in India. The public
        site is under construction.
      </p>
      <p className="text-sm text-zinc-500">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </div>
  );
}
