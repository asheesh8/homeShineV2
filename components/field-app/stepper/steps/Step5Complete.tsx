"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/field-app/ui";
import { CHECKOUT_PLANS, money } from "@/components/field-app/utils";
import { clientPacketDocument, receiptDocument } from "@/lib/field-app-documents";
import { type Assessment, type CheckoutData, formatOwnerAddress } from "@/lib/simple-field";

function openDoc(html: string) {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}

export function Step5Complete({
  client,
  checkout,
  completed,
}: {
  client: Assessment;
  checkout: Partial<CheckoutData>;
  completed: boolean;
}) {
  const plan = CHECKOUT_PLANS.find((p) => p.id === checkout.planId);

  const fullCheckout: CheckoutData = {
    planId: checkout.planId!,
    planName: checkout.planName ?? "",
    planPrice: checkout.planPrice ?? 0,
    paymentOption: checkout.paymentOption ?? "full",
    contractNote: checkout.contractNote ?? "",
    createdAt: checkout.createdAt ?? new Date().toISOString(),
  };

  const finalAssessment: Assessment = {
    ...client,
    status: "finished",
    checkout: fullCheckout,
  };

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
              {plan.name} &middot; {money(plan.price)}
            </div>
          )}
        </div>

        <div className="hs-review-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => openDoc(receiptDocument(finalAssessment))}
          >
            View receipt
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => openDoc(clientPacketDocument(finalAssessment))}
          >
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
          Review the final details and mark this job as done. The assessment will be saved as finished and the quote will be locked in.
        </p>
      </div>

      {/* Final job summary */}
      <section className="hs-step-section">
        <p className="hs-step-section-label">Job summary</p>
        <div className="hs-review-row">
          <span>Client</span>
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
        {plan && (
          <div className="hs-review-row">
            <span>Plan</span>
            <strong>{plan.name}</strong>
          </div>
        )}
        {plan && (
          <div className="hs-review-row">
            <span>Total</span>
            <strong>{money(plan.price)}</strong>
          </div>
        )}
        <div className="hs-review-row">
          <span>Payment</span>
          <strong>
            {checkout.paymentOption === "deposit-monthly"
              ? "Deposit + monthly"
              : "Pay in full"}
          </strong>
        </div>
      </section>

      {checkout.contractNote && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">Access &amp; scheduling notes</p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.65 }}>
            {checkout.contractNote}
          </p>
        </section>
      )}

      <p className="hs-step-hint">
        Clicking <strong>Mark as complete</strong> saves the quote, marks the assessment finished, and unlocks the receipt and client packet.
      </p>
    </div>
  );
}
