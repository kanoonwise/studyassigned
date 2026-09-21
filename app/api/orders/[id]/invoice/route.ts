import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildInvoiceLines, buildInvoiceLinesForPdf } from "@/lib/invoice";
import { renderTextPdf } from "@/lib/pdf";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: order } = await supabase
    .from("orders")
    .select("id, student_id, service")
    .eq("id", id)
    .single();
  if (!order || order.student_id !== user.id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { data: payments } = await supabase
    .from("payments")
    .select("milestone, amount, status, razorpay_payment_id")
    .eq("order_id", id);

  const lines = buildInvoiceLines(payments ?? []);
  if (lines.length === 0) {
    return NextResponse.json(
      { error: "No payments recorded for this order yet." },
      { status: 404 },
    );
  }

  const pdfLines = buildInvoiceLinesForPdf(
    `SA-${order.id.slice(0, 8).toUpperCase()}`,
    order.service ?? "Service",
    user.email ?? "Student",
    lines,
  );
  const pdfBytes = await renderTextPdf(pdfLines);

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt-${order.id.slice(0, 8)}.pdf"`,
    },
  });
}
