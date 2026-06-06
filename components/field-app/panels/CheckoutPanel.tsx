"use client";

import { Badge, Button, Panel, TextArea } from "@/components/field-app/ui";
import { DocumentPicker } from "@/components/field-app/panels/DocumentPicker";
import { CHECKOUT_PLANS, getCheckoutPlan, money } from "@/components/field-app/utils";
import type { Assessment, CheckoutData } from "@/lib/simple-field";

export function CheckoutPanel({
  assessment,
  onPickPlan,
  onPaymentOption,
  onNoteChange,
}: {
  assessment: Assessment;
  onPickPlan: (plan: (typeof CHECKOUT_PLANS)[number]) => void;
  onPaymentOption: (paymentOption: CheckoutData["paymentOption"]) => void;
  onNoteChange: (note: string) => void;
}) {
  const selectedPlan = getCheckoutPlan(assessment.checkout?.planId);

  return (
    <Panel>
      <div className="hs-section-heading">
        <div>
          <p className="hs-kicker">Finished checkout</p>
          <h2>Plan and packet</h2>
        </div>
        {selectedPlan && <Badge tone="success">{selectedPlan.name}</Badge>}
      </div>

      <div className="hs-plan-grid">
        {CHECKOUT_PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            className={`hs-plan-card ${plan.featured ? "is-featured" : ""} ${selectedPlan?.id === plan.id ? "is-active" : ""}`}
            onClick={() => onPickPlan(plan)}
          >
            <span>
              <small>{plan.label}</small>
              <strong>{plan.name}</strong>
            </span>
            <b>{money(plan.price)}</b>
            <p>{plan.summary}</p>
          </button>
        ))}
      </div>

      {selectedPlan && (
        <>
          <div className="hs-segmented">
            <button
              type="button"
              className={assessment.checkout?.paymentOption === "full" ? "is-active" : ""}
              onClick={() => onPaymentOption("full")}
            >
              Standard payment
            </button>
            {selectedPlan.id === "protection" && (
              <button
                type="button"
                className={assessment.checkout?.paymentOption === "deposit-monthly" ? "is-active" : ""}
                onClick={() => onPaymentOption("deposit-monthly")}
              >
                Deposit + monthly
              </button>
            )}
          </div>
          <TextArea
            key={`${assessment.checkout?.planId}-${assessment.checkout?.createdAt}`}
            defaultValue={assessment.checkout?.contractNote ?? ""}
            placeholder="Optional contract, access, or scheduling note"
            onBlur={(e) => onNoteChange(e.target.value)}
          />
          <DocumentPicker assessment={assessment} hasCheckout />
        </>
      )}
    </Panel>
  );
}
