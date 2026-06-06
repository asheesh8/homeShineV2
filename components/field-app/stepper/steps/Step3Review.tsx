"use client";

import { FileText, Mail } from "lucide-react";
import { Button } from "@/components/field-app/ui";
import { CHECKOUT_PLANS, money } from "@/components/field-app/utils";
import { clientPacketDocument } from "@/lib/field-app-documents";
import { type Assessment, type CheckoutData, formatOwnerAddress } from "@/lib/simple-field";

export function Step3Review({
  client,
  checkout,
}: {
  client: Assessment;
  checkout: Partial<CheckoutData>;
}) {
  const plan = CHECKOUT_PLANS.find((p) => p.id === checkout.planId);
  const paymentLabel =
    checkout.paymentOption === "deposit-monthly" ? "Deposit + monthly" : "Pay in full";

  // Merge checkout into client for document generation
  const previewAssessment: Assessment = {
    ...client,
    checkout: checkout as CheckoutData,
  };

  function openPacket() {
    const html = clientPacketDocument(previewAssessment);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    setTimeout(() => URL.revokeObjectURL(url), 8000);
  }

  function emailClient() {
    const firstName = client.owner.name.split(" ")[0];
    const subject = encodeURIComponent(
      `HomeSHINE Quote — ${client.owner.name}`
    );
    const body = encodeURIComponent(
      `Hi ${firstName},\n\nThank you for letting us assess your property at ${formatOwnerAddress(client.owner)}.\n\nHere's your service quote:\n\n  Plan: ${plan?.name ?? "To be confirmed"}\n  Total: ${money(plan?.price ?? 0)}\n  Payment: ${paymentLabel}\n\nI'll follow up shortly with the full client packet and next steps.\n\nBest,\nSteven Maestas\nHomeSHINE\n(802) 555-0100`
    );
    window.open(`mailto:${client.owner.email}?subject=${subject}&body=${body}`);
  }

  return (
    <div className="hs-stepper-step">
      <div className="hs-step-heading">
        <span className="hs-step-eyebrow">Step 3 of 5</span>
        <h2>Review &amp; send</h2>
        <p className="hs-step-description">
          Review the quote, preview the full client packet, and send it to{" "}
          {client.owner.name}.
        </p>
      </div>

      {/* Plan banner */}
      {plan ? (
        <div className="hs-review-plan-banner">
          <div>
            <p className="hs-review-plan-eyebrow">{plan.label}</p>
            <p className="hs-review-plan-name">{plan.name}</p>
            <p className="hs-review-plan-payment">{paymentLabel}</p>
          </div>
          <p className="hs-review-plan-price">{money(plan.price)}</p>
        </div>
      ) : (
        <div className="hs-step-placeholder-card" style={{ padding: "20px" }}>
          <p className="hs-step-placeholder-body">No plan selected — go back to Step 2.</p>
        </div>
      )}

      {/* Client details */}
      <section className="hs-step-section">
        <p className="hs-step-section-label">Client</p>
        <div className="hs-review-row">
          <span>Name</span>
          <strong>{client.owner.name}</strong>
        </div>
        <div className="hs-review-row">
          <span>Address</span>
          <strong>{formatOwnerAddress(client.owner)}</strong>
        </div>
        <div className="hs-review-row">
          <span>Phone</span>
          <strong>{client.owner.phone}</strong>
        </div>
        <div className="hs-review-row">
          <span>Email</span>
          <strong>{client.owner.email}</strong>
        </div>
      </section>

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

      {/* Contract notes */}
      {checkout.contractNote && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">Access &amp; scheduling notes</p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65 }}>
            {checkout.contractNote}
          </p>
        </section>
      )}

      {/* Actions */}
      <div className="hs-review-actions">
        <Button type="button" variant="secondary" onClick={openPacket}>
          <FileText size={16} />
          Preview client packet
        </Button>
        <Button type="button" variant="secondary" onClick={emailClient}>
          <Mail size={16} />
          Email client
        </Button>
      </div>

      <p className="hs-step-hint">
        Hit <strong>Next</strong> once you&rsquo;ve sent the quote and are waiting on client approval.
      </p>
    </div>
  );
}
