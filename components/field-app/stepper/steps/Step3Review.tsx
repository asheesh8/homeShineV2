"use client";

import { FileText, Mail } from "lucide-react";
import { Button } from "@/components/field-app/ui";
import { CHECKOUT_PLANS, money, moneyDecimal } from "@/components/field-app/utils";
import { type TownTaxRate } from "@/lib/tax-rates";
import { clientPacketDocument } from "@/lib/field-app-documents";
import { type Assessment, type CheckoutData, formatOwnerAddress } from "@/lib/simple-field";

export function Step3Review({
  client,
  checkout,
  townTax,
}: {
  client: Assessment;
  checkout: Partial<CheckoutData>;
  townTax: TownTaxRate | null;
}) {
  const plan             = CHECKOUT_PLANS.find((p) => p.id === checkout.planId);
  const isDepositMonthly = checkout.paymentOption === "deposit-monthly";
  const paymentLabel     = isDepositMonthly ? "Deposit + monthly" : "Pay in full";

  /* ── price math ── */
  const taxRate    = townTax?.totalRate ?? checkout.taxRate ?? 0.06;
  const taxPct     = Math.round(taxRate * 100);
  const subtotal   = plan?.price ?? 0;
  const discount   = Math.min(checkout.discountAmount ?? 0, subtotal);
  const discounted = subtotal - discount;
  const taxAmount  = discounted * taxRate;
  const total      = discounted + taxAmount;

  const breakdown = plan && isDepositMonthly && plan.deposit != null
    ? (() => {
        const dep     = plan.deposit ?? 0;
        const months  = plan.months  ?? 12;
        const monthly = (total - dep) / months;
        return { depositAmount: dep, monthlyAmount: monthly, months };
      })()
    : null;

  function openPacket() {
    // Build a fully-enriched checkout so clientPacketDocument has all the
    // computed amounts (tax, total, discount, deposit/monthly schedule).
    const enrichedCheckout: CheckoutData = {
      planId:        checkout.planId!,
      planName:      checkout.planName   ?? plan?.name ?? "",
      planPrice:     checkout.planPrice  ?? plan?.price ?? 0,
      paymentOption: checkout.paymentOption ?? "full",
      contractNote:  checkout.contractNote  ?? "",
      createdAt:     checkout.createdAt     ?? new Date().toISOString(),
      taxRate,
      taxAmount,
      totalAmount:   total,
      discountAmount: discount > 0 ? discount : undefined,
      discountNote:   checkout.discountNote,
      depositAmount:  breakdown?.depositAmount,
      monthlyAmount:  breakdown?.monthlyAmount,
      months:         breakdown?.months,
    };
    const previewAssessment: Assessment = { ...client, checkout: enrichedCheckout };
    const html = clientPacketDocument(previewAssessment);
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 8000);
  }

  function emailClient() {
    const firstName  = client.owner.name.split(" ")[0];
    const subject    = encodeURIComponent(`HomeSHINE Quote — ${client.owner.name}`);
    const taxDesc    = `${taxPct}%`;
    const discountLine = discount > 0
      ? `  Discount${checkout.discountNote ? ` (${checkout.discountNote})` : ""}: -${money(discount)}\n`
      : "";
    const paymentLine = breakdown
      ? `  Deposit today: ${money(breakdown.depositAmount)}\n  Then ${breakdown.months} monthly payments of ${moneyDecimal(breakdown.monthlyAmount)}/mo`
      : `  Total: ${moneyDecimal(total)} (pay in full)`;
    const body = encodeURIComponent(
      `Hi ${firstName},\n\nThank you for letting us assess your property at ${formatOwnerAddress(client.owner)}.\n\nHere's your service quote:\n\n  Plan: ${plan?.name ?? "To be confirmed"}\n  List price: ${money(subtotal)}\n${discountLine}  Tax (${taxDesc}): ${moneyDecimal(taxAmount)}\n${paymentLine}\n\nI'll follow up shortly with the full client packet and next steps.\n\nBest,\nSteven Maestas\nHomeSHINE\n802-391-9977`
    );
    window.open(`mailto:${client.owner.email}?subject=${subject}&body=${body}`);
  }

  return (
    <div className="hs-stepper-step">
      <div className="hs-step-heading">
        <span className="hs-step-eyebrow">Step 3 of 5</span>
        <h2>Review &amp; send</h2>
        <p className="hs-step-description">
          Review the quote, preview the full client packet, and send it to {client.owner.name}.
        </p>
      </div>

      {/* Plan banner */}
      {plan ? (
        <div className="hs-review-plan-banner">
          <div>
            <p className="hs-review-plan-eyebrow">{plan.label}</p>
            <p className="hs-review-plan-name">{plan.name}</p>
            <p className="hs-review-plan-payment">{paymentLabel}</p>
            {discount > 0 && (
              <p className="hs-review-plan-discount-chip">
                −{money(discount)} discount applied
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            {discount > 0 && (
              <p className="hs-review-plan-original">{money(subtotal)}</p>
            )}
            <p className="hs-review-plan-price">{moneyDecimal(total)}</p>
            <p className="hs-review-plan-tax">
              incl. {taxPct}% tax
            </p>
          </div>
        </div>
      ) : (
        <div className="hs-step-placeholder-card" style={{ padding: "20px" }}>
          <p className="hs-step-placeholder-body">No plan selected — go back to Step 2.</p>
        </div>
      )}

      {/* Client details */}
      <section className="hs-step-section">
        <p className="hs-step-section-label">Client</p>
        <div className="hs-review-row"><span>Name</span><strong>{client.owner.name}</strong></div>
        <div className="hs-review-row"><span>Address</span><strong>{formatOwnerAddress(client.owner)}</strong></div>
        <div className="hs-review-row"><span>Phone</span><strong>{client.owner.phone}</strong></div>
        <div className="hs-review-row"><span>Email</span><strong>{client.owner.email}</strong></div>
      </section>

      {/* Pricing breakdown */}
      {plan && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">Pricing</p>
          <div className="hs-review-row">
            <span>List price</span>
            <strong>{money(subtotal)}</strong>
          </div>
          {discount > 0 && (
            <div className="hs-review-row hs-review-row--discount">
              <span>
                Discount
                {checkout.discountNote ? ` · ${checkout.discountNote}` : ""}
              </span>
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
            <span>Tax ({taxPct}%)</span>
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
                <span>Remaining balance ({breakdown.months} × {moneyDecimal(breakdown.monthlyAmount)})</span>
                <span>{moneyDecimal(breakdown.monthlyAmount * breakdown.months)}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* What's included */}
      {plan && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">What&rsquo;s included</p>
          <ul className="hs-review-includes">
            {plan.includes.map((item) => (
              <li key={item}>
                <span className="hs-review-check">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {checkout.contractNote && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">Access &amp; scheduling notes</p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65 }}>{checkout.contractNote}</p>
        </section>
      )}

      <div className="hs-review-actions">
        <Button type="button" variant="secondary" onClick={openPacket}>
          <FileText size={16} /> Preview client packet
        </Button>
        <Button type="button" variant="secondary" onClick={emailClient}>
          <Mail size={16} /> Email client
        </Button>
      </div>

      <p className="hs-step-hint">
        Hit <strong>Next</strong> once you&rsquo;ve sent the quote and are waiting on client approval.
      </p>
    </div>
  );
}
