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

export async function sendDeadlineVerifiedNotification(
  contact: string,
  institutionName: string,
  eventType: string,
  exactDate: string | null,
) {
  const resend = client();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: contact,
    subject: `${institutionName}: a deadline you asked about is now verified`,
    text: [
      `${eventType}${exactDate ? ` - ${exactDate}` : ""}`,
      "",
      "This is now verified against an official source. Check the institution page for the evidence link.",
      "",
      "Informational only. Your institution's own rules and official notices apply.",
    ].join("\n"),
  });
}

const STATUS_MESSAGE: Record<string, string> = {
  submitted: "We've received your request and will review it shortly.",
  screened: "Your request has been reviewed by our team.",
  quoted: "A quote is ready - sign in to your account to review and pay the deposit.",
  paid_part: "Deposit received. We're getting started.",
  in_progress: "Your order is in progress.",
  delivered: "Your order has been delivered - check your account.",
  closed: "Your order is now closed.",
  declined: "We're unable to take on this request.",
  refunded: "This order has been refunded.",
};

export async function sendOrderStatusEmail(to: string, service: string, status: string) {
  const resend = client();
  if (!resend || !to) return;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Update on your ${service} order`,
    text: [
      STATUS_MESSAGE[status] ?? `Your order status is now: ${status}`,
      "",
      "Informational only. Your institution's own rules and official notices apply.",
    ].join("\n"),
  });
}

export async function sendDeadlineReminderEmail(
  contact: string,
  institutionName: string,
  eventType: string,
  exactDate: string,
  unsubscribeUrl: string,
) {
  const resend = client();
  if (!resend) return;

  await resend.emails.send({
    from: FROM,
    to: contact,
    subject: `Reminder: ${institutionName} - ${eventType}`,
    text: [
      `${eventType} - ${exactDate}`,
      "",
      "This is a verified date. Check the institution page for the evidence link.",
      "",
      "Informational only. Your institution's own rules and official notices apply.",
      "",
      `Unsubscribe from this reminder: ${unsubscribeUrl}`,
    ].join("\n"),
  });
}
