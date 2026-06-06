import type { Assessment, CheckoutData, FieldDefinition } from "@/lib/simple-field";
import type { CheckoutPlan } from "@/components/field-app/types";

export const SESSION_KEY = "homeshine-simple-session-v2";

/** Vermont service tax rate */
export const TAX_RATE = 0.06;

export const CHECKOUT_PLANS: CheckoutPlan[] = [
  {
    id: "shine-now",
    name: "SHINE NOW",
    price: 2750,
    label: "One-time service",
    summary: "A full exterior reset for a home that needs to look clean now.",
    includes: ["Gutters", "Siding", "Windows and screens", "Walkways", "Deck or patio"],
  },
  {
    id: "protection",
    name: "Protection Plan",
    price: 3500,
    label: "18 month plan",
    summary: "A deep clean plus scheduled maintenance to keep buildup from returning.",
    includes: ["Day 1 deep clean", "Month 12 maintenance", "Month 18 tune-up", "Priority scheduling"],
    featured: true,
    deposit: 500,
    months: 18,
  },
  {
    id: "shine-ready",
    name: "SHINE Ready",
    price: 5000,
    label: "Selling the home",
    summary: "Market-ready exterior care for showings, photos, and curb appeal.",
    includes: ["Curb appeal reset", "Show-ready touch-ups", "Exterior care certificate"],
  },
  {
    id: "shine-renew",
    name: "SHINE Renew",
    price: 7500,
    label: "Full restoration",
    summary: "A deeper renewal path for older, stained, or overgrown properties.",
    includes: ["Roof-to-curb restoration", "Renewal planning", "Specialty surface care"],
  },
];

export function statusLabel(status: Assessment["status"]) {
  if (status === "draft") return "Draft";
  if (status === "ongoing") return "Ongoing";
  return "Finished";
}

export function statusTone(status: Assessment["status"]) {
  if (status === "draft") return "neutral";
  if (status === "ongoing") return "warning";
  return "success";
}

/** Formats a whole-dollar amount: $3,500 */
export function money(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

/** Formats with up to 2 decimal places (drops .00): $178.33 or $500 */
export function moneyDecimal(value: number) {
  const fixed = value.toFixed(2);
  const [dollars, cents] = fixed.split(".");
  const formatted = `$${Number(dollars).toLocaleString()}`;
  return cents === "00" ? formatted : `${formatted}.${cents}`;
}

/** Calculate tax amount */
export function calcTax(price: number) {
  return price * TAX_RATE;
}

/** Calculate total including tax */
export function calcTotal(price: number) {
  return price + calcTax(price);
}

/**
 * Build the payment breakdown for deposit-monthly plans.
 * Returns depositAmount, monthlyAmount, months — all rounded to 2 decimal places.
 */
export function calcDepositMonthly(plan: CheckoutPlan) {
  const total = calcTotal(plan.price);
  const deposit = plan.deposit ?? 0;
  const months = plan.months ?? 12;
  const monthly = (total - deposit) / months;
  return { depositAmount: deposit, monthlyAmount: monthly, months };
}

/**
 * Build the full tax + payment fields to merge into CheckoutData.
 * Pass a custom taxRate (e.g. from the town lookup) to override the default.
 * Discount is subtracted from the plan price BEFORE tax is applied.
 */
export function buildCheckoutAmounts(
  plan: CheckoutPlan,
  paymentOption: CheckoutData["paymentOption"],
  taxRate: number = TAX_RATE,
  discountAmount = 0
): Pick<CheckoutData, "taxRate" | "taxAmount" | "totalAmount" | "depositAmount" | "monthlyAmount" | "months"> {
  const discounted = Math.max(0, plan.price - discountAmount);
  const taxAmount  = discounted * taxRate;
  const totalAmount = discounted + taxAmount;
  if (paymentOption === "deposit-monthly" && plan.deposit != null && plan.months != null) {
    const deposit = plan.deposit ?? 0;
    const months  = plan.months ?? 12;
    const monthly = (totalAmount - deposit) / months;
    return { taxRate, taxAmount, totalAmount, depositAmount: deposit, monthlyAmount: monthly, months };
  }
  return { taxRate, taxAmount, totalAmount };
}

export function countDone(assessment: Assessment) {
  return Object.values(assessment.sections).filter(Boolean).length;
}

export function prettyLabel(field: FieldDefinition) {
  return field.emoji ? `${field.emoji} ${field.label}` : field.label;
}

export function getMatches(query: string, options: readonly string[]) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [...options].slice(0, 8);
  return options.filter((option) => option.toLowerCase().includes(trimmed)).slice(0, 8);
}

export function getCheckoutPlan(planId: string | undefined) {
  return CHECKOUT_PLANS.find((plan) => plan.id === planId) ?? null;
}
