import type { Metadata } from "next";
import { EnquiryForm } from "./EnquiryForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send us an enquiry and a human on our team will follow up.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Tell us what you need. A human on our team reviews every enquiry.
      </p>
      <EnquiryForm />
    </div>
  );
}
