export interface InvoicePayment {
  milestone: string | null;
  amount: number | null;
  status: string | null;
  razorpay_payment_id: string | null;
}

export interface InvoiceLine {
  milestone: string;
  amountRupees: number;
  paymentId: string;
}

/** Only captured (successful) payments count toward an invoice. */
export function buildInvoiceLines(payments: InvoicePayment[]): InvoiceLine[] {
  return payments
    .filter((p) => p.status === "captured" && p.amount != null)
    .map((p) => ({
      milestone: p.milestone ?? "payment",
      amountRupees: (p.amount ?? 0) / 100,
      paymentId: p.razorpay_payment_id ?? "-",
    }));
}

export function invoiceTotal(lines: InvoiceLine[]): number {
  return lines.reduce((sum, line) => sum + line.amountRupees, 0);
}

export function buildInvoiceLinesForPdf(
  invoiceNumber: string,
  orderService: string,
  studentName: string,
  lines: InvoiceLine[],
): string[] {
  const total = invoiceTotal(lines);
  const body = [
    "Invoice",
    `Invoice #: ${invoiceNumber}`,
    `Issued: ${new Date().toISOString().slice(0, 10)}`,
    `Billed to: ${studentName}`,
    `Service: ${orderService}`,
    "",
  ];
  for (const line of lines) {
    body.push(`${line.milestone}: Rs. ${line.amountRupees.toFixed(2)} (ref ${line.paymentId})`);
  }
  body.push(
    "",
    `Total paid: Rs. ${total.toFixed(2)}`,
    "",
    "This is a payment receipt, not a tax invoice.",
  );
  return body;
}
