import type { Assessment, FieldDefinition } from "@/lib/simple-field";
import type { CheckoutPlan } from "@/components/field-app/types";

export const SESSION_KEY = "homeshine-simple-session-v2";

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

export function money(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
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
