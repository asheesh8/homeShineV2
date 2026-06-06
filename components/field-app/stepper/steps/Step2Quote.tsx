"use client";

import { Check } from "lucide-react";
import { FieldLabel, TextArea } from "@/components/field-app/ui";
import { CHECKOUT_PLANS, money } from "@/components/field-app/utils";
import { type Assessment, type CheckoutData, formatOwnerAddress } from "@/lib/simple-field";

export function Step2Quote({
  client,
  checkout,
  onUpdate,
}: {
  client: Assessment;
  checkout: Partial<CheckoutData>;
  onUpdate: (patch: Partial<CheckoutData>) => void;
}) {
  const selectedPlan = CHECKOUT_PLANS.find((p) => p.id === checkout.planId);

  function selectPlan(plan: (typeof CHECKOUT_PLANS)[number]) {
    onUpdate({
      planId: plan.id,
      planName: plan.name,
      planPrice: plan.price,
      paymentOption:
        plan.id === "protection"
          ? checkout.paymentOption ?? "deposit-monthly"
          : "full",
      createdAt: checkout.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <div className="hs-stepper-step">
      <div className="hs-step-heading">
        <span className="hs-step-eyebrow">Step 2 of 5</span>
        <h2>Build the quote</h2>
        <p className="hs-step-description">
          Choose a service plan for {client.owner.name} and add any access or scheduling notes.
        </p>
      </div>

      {/* Client reminder strip */}
      <div className="hs-quote-client-strip">
        <div>
          <strong>{client.owner.name}</strong>
          <span>{formatOwnerAddress(client.owner)}</span>
        </div>
        <span>{client.owner.phone}</span>
      </div>

      {/* Plan cards */}
      <section className="hs-step-section">
        <p className="hs-step-section-label">Service plan *</p>
        <div className="hs-quote-plan-grid">
          {CHECKOUT_PLANS.map((plan) => {
            const isSelected = checkout.planId === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                className={`hs-quote-plan-card ${isSelected ? "is-selected" : ""} ${plan.featured ? "is-featured" : ""}`}
                onClick={() => selectPlan(plan)}
              >
                {plan.featured && (
                  <span className="hs-quote-plan-popular">Most popular</span>
                )}
                <div className="hs-quote-plan-top">
                  <div>
                    <p className="hs-quote-plan-label">{plan.label}</p>
                    <p className="hs-quote-plan-name">{plan.name}</p>
                  </div>
                  {isSelected && (
                    <span className="hs-quote-plan-checkmark">
                      <Check size={13} />
                    </span>
                  )}
                </div>
                <p className="hs-quote-plan-price">{money(plan.price)}</p>
                <p className="hs-quote-plan-summary">{plan.summary}</p>
                <ul className="hs-quote-plan-includes">
                  {plan.includes.map((item) => (
                    <li key={item}>
                      <span className="hs-quote-plan-dot">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      {/* Payment option — Protection Plan only */}
      {selectedPlan && (
        <section className="hs-step-section">
          <p className="hs-step-section-label">Payment option</p>
          <div className="hs-segmented">
            <button
              type="button"
              className={checkout.paymentOption === "full" ? "is-active" : ""}
              onClick={() => onUpdate({ paymentOption: "full" })}
            >
              Pay in full
            </button>
            {selectedPlan.id === "protection" && (
              <button
                type="button"
                className={checkout.paymentOption === "deposit-monthly" ? "is-active" : ""}
                onClick={() => onUpdate({ paymentOption: "deposit-monthly" })}
              >
                Deposit + monthly
              </button>
            )}
          </div>
        </section>
      )}

      {/* Access / scheduling notes */}
      <section className="hs-step-section">
        <FieldLabel>Access &amp; scheduling notes</FieldLabel>
        <TextArea
          placeholder="Gate code, preferred timing, parking instructions…"
          value={checkout.contractNote ?? ""}
          onChange={(e) => onUpdate({ contractNote: e.target.value })}
          style={{ minHeight: 96 }}
        />
      </section>

      {/* Price total */}
      {selectedPlan && (
        <div className="hs-quote-total-row">
          <span className="hs-quote-total-label">Quote total</span>
          <strong className="hs-quote-total-price">{money(selectedPlan.price)}</strong>
        </div>
      )}
    </div>
  );
}
