import { describe, expect, it } from "vitest";
import { buildInvoiceLines, invoiceTotal, buildInvoiceLinesForPdf } from "@/lib/invoice";

describe("buildInvoiceLines", () => {
  it("only includes captured payments, converting paise to rupees", () => {
    const lines = buildInvoiceLines([
      { milestone: "deposit", amount: 300000, status: "captured", razorpay_payment_id: "pay_1" },
      { milestone: "final", amount: 700000, status: "created", razorpay_payment_id: "pay_2" },
    ]);
    expect(lines).toEqual([{ milestone: "deposit", amountRupees: 3000, paymentId: "pay_1" }]);
  });

  it("returns an empty list when nothing has been captured", () => {
    expect(buildInvoiceLines([])).toEqual([]);
  });
});

describe("invoiceTotal", () => {
  it("sums all line amounts", () => {
    const total = invoiceTotal([
      { milestone: "deposit", amountRupees: 3000, paymentId: "pay_1" },
      { milestone: "final", amountRupees: 7000, paymentId: "pay_2" },
    ]);
    expect(total).toBe(10000);
  });
});

describe("buildInvoiceLinesForPdf", () => {
  it("includes the invoice number, totals, and a non-tax-invoice notice", () => {
    const lines = buildInvoiceLinesForPdf("INV-1", "Editing", "Asha Rao", [
      { milestone: "deposit", amountRupees: 3000, paymentId: "pay_1" },
    ]);
    const text = lines.join("\n");
    expect(text).toContain("INV-1");
    expect(text).toContain("Asha Rao");
    expect(text).toContain("Total paid: Rs. 3000.00");
    expect(text).toContain("not a tax invoice");
  });
});
