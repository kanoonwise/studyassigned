import "server-only";
import { Resend } from "resend";

const FROM = "StudyAssigned <notifications@studyassigned.example>";
const TEAM_INBOX = process.env.TEAM_NOTIFICATION_EMAIL ?? "team@studyassigned.example";

function client() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null; // Not configured yet outside a real deployment - callers no-op.
  return new Resend(apiKey);
}

export async function sendEnquiryNotification(lead: {
  name: string | null;
  email: string | null;
  phone: string | null;
  service: string | null;
  message: string | null;
  flagged: boolean;
}) {
  const resend = client();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: TEAM_INBOX,
    subject: lead.flagged ? "[Flagged] New enquiry" : "New enquiry",
    text: [
      `Name: ${lead.name ?? "-"}`,
      `Email: ${lead.email ?? "-"}`,
      `Phone: ${lead.phone ?? "-"}`,
      `Service: ${lead.service ?? "-"}`,
      lead.flagged ? "FLAGGED for review" : null,
      "",
      lead.message ?? "",
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
