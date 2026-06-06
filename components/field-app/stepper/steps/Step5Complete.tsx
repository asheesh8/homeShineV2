"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/field-app/ui";
import { CHECKOUT_PLANS, money, moneyDecimal, TAX_RATE } from "@/components/field-app/utils";
import { type TownTaxRate } from "@/lib/tax-rates";
import { clientPacketDocument, receiptDocument } from "@/lib/field-app-documents";
import { type Assessment, type CheckoutData, formatOwnerAddress } from "@/lib/simple-field";

function openDoc(html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export function Step5Complete({
  client,
  checkout,
  townTax,
  completed,
}: {
  client: Assessment;
  checkout: Partial<CheckoutData>;
  townTax: TownTaxRate | null;
  completed: boolean;
}) {
  const plan             = CHECKOUT_PLANS.find((p) => p.id === checkout.planId);
  const isDepositMonthly = checkout.paymentOption === "deposit-monthly";

  /* ── price math — prefer stored amounts (post-complete), fall back to live ── */
  const taxRate    = checkout.taxRate   ?? townTax?.totalRate ?? TAX_RATE;
  const taxPct     = Math.round(taxRate * 100);
  const subtotal   = plan?.price ?? 0;
  const discount   = Math.min(checkout.discountAmount ?? 0, subtotal);
  const discounted = subtotal - discount;
  const taxAmount  = checkout.taxAmount   ?? discounted * taxRate;
  const total      = checkout.totalAmount ?? discounted + taxAmount;

  const breakdown = checkout.depositAmount != null && checkout.monthlyAmount != null && checkout.months != null
    ? { depositAmount: checkout.depositAmount, monthlyAmount: checkout.monthlyAmount, months: checkout.months }
    : plan && isDepositMonthly && plan.deposit != null
    ? (() => {
        const dep     = plan.deposit ?? 0;
        const months  = plan.months  ?? 12;
        const monthly = (total - dep) / months;
        return { depositAmount: dep, monthlyAmount: monthly, months };
      })()
    : null;

  const fullCheckout: CheckoutData = {
    planId:        checkout.planId!,
    planName:      checkout.planName   ?? "",
    planPrice:     checkout.planPrice  ?? 0,
    paymentOption: checkout.paymentOption ?? "full",
    contractNote:  checkout.contractNote  ?? "",
    createdAt:     checkout.createdAt     ?? new Date().toISOString(),
    taxRate,
    taxAmount,
    totalAmount:   total,
    depositAmount: breakdown?.depositAmount,
    monthlyAmount: breakdown?.monthlyAmount,
    months:        breakdown?.months,
    discountAmount: discount > 0 ? discount : undefined,
    discountNote:   checkout.discountNote,
  };

  const finalAssessment: Assessment = { ...client, status: "finished", checkout: fullCheckout };

  if (completed) {
    return (
      <div className="hs-stepper-step">
        <div className="hs-complete-success">
          <CheckCircle2 size={56} className="hs-complete-icon" />
          <h2>All done!</h2>
          <p className="hs-complete-sub">
            {client.owner.name}&rsquo;s assessment is marked finished and the quote is saved.
          </p>
          <p className="hs-complete-address">{formatOwnerAddress(client.owner)}</p>
          {plan && (
            <div className="hs-complete-plan-chip">
              {plan.name} &middot; {moneyDecimal(total)}
              {discount > 0 && <span className="hs-complete-discount-tag">−{money(discount)} discount</span>}
            </div>
          )}
        </div>

        <div className="hs-review-actions">
          <Button type="button" variant="secondary" onClick={() => openDoc(receiptDocument(finalAssessment))}>
            View receipt
          </Button>
          <Button type="button" variant="secondary" onClick={() => openDoc(clientPacketDocument(finalAssessment))}>
            Client packet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="hs-stepper-step">
      <div className="hs-step-heading">
        <span className="hs-step-eyebrow">Step 5 of 5</span>
        <h2>Complete the job</h2>
        <p className="hs-step-description">
          Review the final details and mark this job as done.
        </p>
      </div>

      <section className="hs-step-section">
        <p className="hs-step-section-label">Job summary</p>
        <div className="hs-review-row"><span>Client</span><strong>{client.owner.name}</strong></div>
        <div className="hs-review-row"><span>Address</span><strong>{formatOwnerAddress(client.owner)}</strong></div>
        <div className="hs-review-row"><span>Phone</span><strong>{client.owner.phone}</strong></div>
        {plan && <div className="hs-review-row"><span>Plan</span><strong>{plan.name}</strong></div>}
        <div className="hs-review-row">
          <span>Payment</span>
          <strong>{isDepositMonthly ? "Deposit + monthly" : "Pay in full"}</strong>
        </div>
      </section>

      {plan && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">Pricing</p>
          <div className="hs-review-row">
            <span>List price</span>
            <strong>{money(subtotal)}</strong>
          </div>
          {discount > 0 && (
            <div className="hs-review-row hs-review-row--discount">
              <span>Discount{checkout.discountNote ? ` · ${checkout.discountNote}` : ""}</span>
              <strong>−{money(discount)}</strong>
            </div>
          )}
          {discount > 0 && (
            <div className="hs-review-row">
              <span>Subtotal after discount</span>
              <strong>{money(discounted)}</strong>
            </div>
          )}
          <div className="hs-review-row">
            <span>Tax ({taxPct}%{townTax?.localRate ? ` · ${client.owner.city} local option` : " · VT state"})</span>
            <strong>{moneyDecimal(taxAmount)}</strong>
          </div>
          <div className="hs-review-row" style={{ borderTop: "2px solid var(--line)", marginTop: 4 }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <strong style={{ fontSize: 17 }}>{moneyDecimal(total)}</strong>
          </div>

          {breakdown && (
            <div className="hs-review-payment-breakdown">
              <div className="hs-review-breakdown-label">Payment schedule</div>
              <div className="hs-review-breakdown-row">
                <span>Deposit due today</span>
                <strong>{money(breakdown.depositAmount)}</strong>
              </div>
              <div className="hs-review-breakdown-row">
                <span>Monthly payment × {breakdown.months}</span>
                <strong>
                  {moneyDecimal(breakdown.monthlyAmount)}
                  <span style={{ fontWeight: 400, fontSize: 12, color: "var(--muted)" }}>/mo</span>
                </strong>
              </div>
              <div className="hs-review-breakdown-row hs-review-breakdown-row--sub">
                <span>Remaining balance</span>
                <span>{moneyDecimal(breakdown.monthlyAmount * breakdown.months)}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {checkout.contractNote && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">Access &amp; scheduling notes</p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65 }}>{checkout.contractNote}</p>
        </section>
      )}

      <p className="hs-step-hint">
        Clicking <strong>Mark as complete</strong> saves the quote, marks the assessment finished, and unlocks the receipt and client packet.
      </p>
    </div>
  );
}
