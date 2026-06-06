"use client";

import { Check, Loader2 } from "lucide-react";
import { FieldLabel, TextArea } from "@/components/field-app/ui";
import {
  CHECKOUT_PLANS,
  calcDepositMonthly,
  money,
  moneyDecimal,
} from "@/components/field-app/utils";
import { describeTaxRate, type TownTaxRate } from "@/lib/tax-rates";
import { type Assessment, type CheckoutData, formatOwnerAddress } from "@/lib/simple-field";

export function Step2Quote({
  client,
  checkout,
  townTax,
  taxLoading,
  onUpdate,
}: {
  client: Assessment;
  checkout: Partial<CheckoutData>;
  townTax: TownTaxRate | null;
  taxLoading: boolean;
  onUpdate: (patch: Partial<CheckoutData>) => void;
}) {
  const selectedPlan = CHECKOUT_PLANS.find((p) => p.id === checkout.planId);
  const isDepositMonthly = checkout.paymentOption === "deposit-monthly";

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

  /* ── Tax math using town-specific rate ── */
  const taxRate   = townTax?.totalRate ?? checkout.taxRate ?? 0.06;
  const subtotal  = selectedPlan?.price ?? 0;
  const taxAmount = subtotal * taxRate;
  const total     = subtotal + taxAmount;
  const taxPct    = Math.round(taxRate * 100);

  /* ── Deposit / monthly breakdown ── */
  const breakdown =
    selectedPlan && isDepositMonthly && selectedPlan.deposit != null
      ? (() => {
          const deposit = selectedPlan.deposit ?? 0;
          const months  = selectedPlan.months ?? 12;
          const monthly = (total - deposit) / months;
          return { depositAmount: deposit, monthlyAmount: monthly, months };
        })()
      : null;

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

      {/* Town tax badge */}
      <div className="hs-tax-badge">
        {taxLoading ? (
          <><Loader2 size={12} className="hs-tax-badge-spin" /> Looking up {client.owner.city} tax rate…</>
        ) : townTax ? (
          <>
            <span className="hs-tax-badge-dot" />
            {client.owner.city}: {describeTaxRate(townTax)}
            {!townTax.found && <span className="hs-tax-badge-fallback"> (using VT default)</span>}
          </>
        ) : (
          <><span className="hs-tax-badge-dot" /> Vermont state tax: 6%</>
        )}
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

      {/* Payment option */}
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
            {selectedPlan.deposit != null && (
              <button
                type="button"
                className={isDepositMonthly ? "is-active" : ""}
                onClick={() => onUpdate({ paymentOption: "deposit-monthly" })}
              >
                Deposit + monthly
              </button>
            )}
          </div>

          {/* Deposit breakdown */}
          {breakdown && (
            <div className="hs-payment-breakdown">
              <div className="hs-payment-breakdown-row">
                <span>Deposit due today</span>
                <strong>{money(breakdown.depositAmount)}</strong>
              </div>
              <div className="hs-payment-breakdown-row hs-payment-breakdown-row--monthly">
                <span>Then {breakdown.months} monthly payments of</span>
                <strong>{moneyDecimal(breakdown.monthlyAmount)}<span className="hs-payment-mo">/mo</span></strong>
              </div>
              <div className="hs-payment-breakdown-row hs-payment-breakdown-row--sub">
                <span>Remaining balance ({breakdown.months} × {moneyDecimal(breakdown.monthlyAmount)})</span>
                <span>{moneyDecimal(breakdown.monthlyAmount * breakdown.months)}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Access notes */}
      <section className="hs-step-section">
        <FieldLabel>Access &amp; scheduling notes</FieldLabel>
        <TextArea
          placeholder="Gate code, preferred timing, parking instructions…"
          value={checkout.contractNote ?? ""}
          onChange={(e) => onUpdate({ contractNote: e.target.value })}
          style={{ minHeight: 96 }}
        />
      </section>

      {/* Price total with town-specific tax */}
      {selectedPlan && (
        <div className="hs-quote-total-box">
          <div className="hs-quote-total-line">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="hs-quote-total-line">
            <span>
              Tax ({taxPct}%
              {townTax?.localRate ? ` · ${client.owner.city} local option` : " · VT state"})
            </span>
            <span>{moneyDecimal(taxAmount)}</span>
          </div>
          <div className="hs-quote-total-line hs-quote-total-line--total">
            <span>Total</span>
            <strong>{moneyDecimal(total)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
