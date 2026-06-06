"use client";

import { Check, Loader2, Tag, X } from "lucide-react";
import { useState } from "react";
import { FieldLabel, TextArea, TextInput } from "@/components/field-app/ui";
import {
  CHECKOUT_PLANS,
  money,
  moneyDecimal,
} from "@/components/field-app/utils";
import { type TownTaxRate } from "@/lib/tax-rates";
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
  const selectedPlan      = CHECKOUT_PLANS.find((p) => p.id === checkout.planId);
  const isDepositMonthly  = checkout.paymentOption === "deposit-monthly";
  const [discountOpen, setDiscountOpen] = useState(!!(checkout.discountAmount && checkout.discountAmount > 0));

  function selectPlan(plan: (typeof CHECKOUT_PLANS)[number]) {
    onUpdate({
      planId:        plan.id,
      planName:      plan.name,
      planPrice:     plan.price,
      paymentOption: plan.id === "protection"
        ? checkout.paymentOption ?? "deposit-monthly"
        : "full",
      createdAt: checkout.createdAt ?? new Date().toISOString(),
    });
  }

  function clearDiscount() {
    onUpdate({ discountAmount: undefined, discountNote: undefined });
    setDiscountOpen(false);
  }

  /* ── Price math ── */
  const taxRate      = townTax?.totalRate ?? checkout.taxRate ?? 0.06;
  const taxPct       = Math.round(taxRate * 100);
  const subtotal     = selectedPlan?.price ?? 0;
  const discount     = Math.min(checkout.discountAmount ?? 0, subtotal);
  const discounted   = subtotal - discount;
  const taxAmount    = discounted * taxRate;
  const total        = discounted + taxAmount;

  /* ── Deposit / monthly breakdown (on total-with-discount) ── */
  const breakdown = selectedPlan && isDepositMonthly && selectedPlan.deposit != null
    ? (() => {
        const dep     = selectedPlan.deposit ?? 0;
        const months  = selectedPlan.months  ?? 12;
        const monthly = (total - dep) / months;
        return { depositAmount: dep, monthlyAmount: monthly, months };
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
            {client.owner.city} tax rate: {taxPct}%
            {!townTax.found && <span className="hs-tax-badge-fallback"> (VT default)</span>}
          </>
        ) : (
          <><span className="hs-tax-badge-dot" /> Tax rate: 6%</>
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
                    <span className="hs-quote-plan-checkmark"><Check size={13} /></span>
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
                <span>Remaining ({breakdown.months} × {moneyDecimal(breakdown.monthlyAmount)})</span>
                <span>{moneyDecimal(breakdown.monthlyAmount * breakdown.months)}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── Discount (optional, Steven only) ── */}
      {selectedPlan && (
        <section className="hs-step-section">
          {!discountOpen ? (
            <button
              type="button"
              className="hs-discount-toggle"
              onClick={() => setDiscountOpen(true)}
            >
              <Tag size={13} />
              Add discount
            </button>
          ) : (
            <div className="hs-discount-box">
              <div className="hs-discount-box-header">
                <span className="hs-discount-box-title">
                  <Tag size={13} /> Discount
                </span>
                <button
                  type="button"
                  className="hs-discount-box-close"
                  onClick={clearDiscount}
                  aria-label="Remove discount"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="hs-discount-fields">
                <div>
                  <FieldLabel>Amount ($)</FieldLabel>
                  <TextInput
                    type="number"
                    min={0}
                    max={subtotal}
                    step={1}
                    placeholder="0"
                    value={checkout.discountAmount ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdate({ discountAmount: isNaN(val) || val <= 0 ? undefined : val });
                    }}
                  />
                </div>
                <div>
                  <FieldLabel>Reason <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></FieldLabel>
                  <TextInput
                    placeholder="Customer satisfaction, repeat client…"
                    value={checkout.discountNote ?? ""}
                    onChange={(e) => onUpdate({ discountNote: e.target.value || undefined })}
                  />
                </div>
              </div>

              {discount > 0 && (
                <p className="hs-discount-preview">
                  Saving {money(discount)} off the list price
                  {checkout.discountNote ? ` · ${checkout.discountNote}` : ""}
                </p>
              )}
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

      {/* Pricing total */}
      {selectedPlan && (
        <div className="hs-quote-total-box">
          <div className="hs-quote-total-line">
            <span>List price</span>
            <span>{money(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="hs-quote-total-line hs-quote-total-line--discount">
              <span>
                Discount
                {checkout.discountNote ? ` · ${checkout.discountNote}` : ""}
              </span>
              <span>−{money(discount)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="hs-quote-total-line">
              <span>Subtotal after discount</span>
              <span>{money(discounted)}</span>
            </div>
          )}
          <div className="hs-quote-total-line">
            <span>
              Tax ({taxPct}%)
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
