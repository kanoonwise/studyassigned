import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPastDate, daysUntil, suggestServiceForDeadline } from "@/lib/tools/deadline-status";
import { DeadlineAlertForm } from "@/components/DeadlineAlertForm";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  verified: "Verified",
  link_found: "Calendar found, not yet verified",
  proxy: "Follows an affiliating university's calendar",
  seasonality_only: "No exact date yet",
  manual_required: "Not yet available",
};

async function getData(code: string) {
  const supabase = await createClient();
  const { data: institution } = await supabase
    .from("public_institutions")
    .select("*")
    .eq("aishe_code", code)
    .maybeSingle();
  if (!institution) return null;

  const { data: authority } = institution.calendar_authority_code
    ? await supabase
        .from("public_authorities")
        .select("*")
        .eq("aishe_code", institution.calendar_authority_code)
        .maybeSingle()
    : { data: null };

  const { data: deadlines } = authority
    ? await supabase
        .from("public_deadlines")
        .select("*")
        .eq("authority_code", authority.aishe_code)
        .order("exact_date")
    : { data: [] };

  return { institution, authority, deadlines: deadlines ?? [] };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const data = await getData(code);
  if (!data) return {};

  return {
    title: data.institution.name,
    description: `Deadlines and official links for ${data.institution.name}.`,
    robots: data.institution.status === "verified" ? undefined : { index: false, follow: true },
  };
}

export default async function InstitutionPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getData(code);
  if (!data) notFound();

  const { institution, authority, deadlines } = data;

  const eventJsonLd =
    institution.status === "verified"
      ? deadlines
          .filter((d) => d.exact_date && !isPastDate(d.exact_date))
          .map((d) => ({
            "@context": "https://schema.org",
            "@type": "Event",
            name: d.event_type,
            startDate: d.exact_date,
            eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
            eventStatus: "https://schema.org/EventScheduled",
            location: { "@type": "Place", name: institution.name },
            organizer: { "@type": "EducationalOrganization", name: institution.name },
          }))
      : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {eventJsonLd.map((event, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(event) }}
        />
      ))}
      <h1 className="text-3xl font-semibold tracking-tight">{institution.name}</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {institution.kind} · {institution.district ? `${institution.district}, ` : ""}
        {institution.state}
      </p>
      {institution.website ? (
        <a
          href={institution.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline-offset-4 hover:underline"
        >
          {institution.website}
        </a>
      ) : null}
      {institution.affiliating_name ? (
        <p className="mt-1 text-sm text-zinc-500">Affiliated to {institution.affiliating_name}</p>
      ) : null}

      <div className="mt-8 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <span className="inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium dark:bg-zinc-900">
          {STATUS_LABEL[institution.status] ?? institution.status}
        </span>

        {institution.status === "verified" && deadlines.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-4">
            {deadlines.map((deadline) => {
              const past = deadline.exact_date ? isPastDate(deadline.exact_date) : false;
              const suggestion =
                deadline.exact_date && !past
                  ? suggestServiceForDeadline(deadline.event_type, daysUntil(deadline.exact_date))
                  : null;
              return (
                <li key={deadline.id}>
                  <p className="font-medium">{deadline.event_type}</p>
                  {deadline.exact_date ? (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {past
                        ? "Date has passed"
                        : new Date(deadline.exact_date).toLocaleDateString("en-IN", {
                            dateStyle: "long",
                          })}
                    </p>
                  ) : null}
                  {deadline.verified_at ? (
                    <p className="text-xs text-zinc-500">
                      Last verified {new Date(deadline.verified_at).toLocaleDateString()}
                    </p>
                  ) : null}
                  {deadline.evidence_url ? (
                    <a
                      href={deadline.evidence_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline-offset-4 hover:underline"
                    >
                      Evidence
                    </a>
                  ) : null}
                  {suggestion ? (
                    <p className="mt-1 text-xs">
                      <Link href={suggestion.href} className="underline-offset-4 hover:underline">
                        {suggestion.label}
                      </Link>
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {institution.status === "link_found" ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Official calendar found. We have not verified the dates yet. Please check the official
            page.
          </p>
        ) : null}

        {institution.status === "proxy" && authority ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Your college follows {authority.name}&apos;s calendar. Status:{" "}
            {STATUS_LABEL[authority.status] ?? authority.status}.
          </p>
        ) : null}

        {institution.status === "seasonality_only" || institution.status === "manual_required" ? (
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            No dates available yet.{" "}
            {institution.website ? (
              <a
                href={institution.website}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Visit the institution website
              </a>
            ) : null}
          </p>
        ) : null}

        {authority ? (
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            {authority.calendar_url ? (
              <a
                href={authority.calendar_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Academic calendar
              </a>
            ) : null}
            {authority.exam_url ? (
              <a
                href={authority.exam_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:underline"
              >
                Exam / notice page
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <DeadlineAlertForm
          institutionCode={institution.aishe_code}
          verified={institution.status === "verified"}
        />
      </div>

      <p className="mt-8 text-sm text-zinc-500">
        Informational only. Your institution&apos;s own rules and official notices apply.
      </p>
    </div>
  );
}
