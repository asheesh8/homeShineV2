"use client";

import { startTransition, useState } from "react";
import type { DialogState, ToastState } from "@/components/field-app/types";
import { updateAssessment } from "@/components/field-app/api";
import { type Assessment, type CheckoutData } from "@/lib/simple-field";
import { buildCheckoutAmounts, getCheckoutPlan } from "@/components/field-app/utils";
import { fetchTownTaxRate, type TownTaxRate } from "@/lib/tax-rates";

export const STEPPER_STEPS = [
  { label: "Client",   short: "Client" },
  { label: "Quote",    short: "Quote"  },
  { label: "Review",   short: "Review" },
  { label: "Payment",  short: "Pay"    },
  { label: "Complete", short: "Done"   },
] as const;

type NotifyFns = {
  showToast: (t: ToastState) => void;
  showDialog: (d: DialogState) => void;
};

export function useStepperFlow({ showToast, showDialog }: NotifyFns) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  // The assessment selected in Step 1
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Town tax rate resolved from client's city (loaded when client is selected)
  const [townTax, setTownTax] = useState<TownTaxRate | null>(null);
  const [taxLoading, setTaxLoading] = useState(false);

  // Checkout data built in Step 2
  const [checkoutDraft, setCheckoutDraft] = useState<Partial<CheckoutData>>({});

  /* ── Step 1 ──────────────────────────────────────────────────────────── */

  async function selectClient(assessment: Assessment | null) {
    setSelectedAssessment(assessment);
    setTownTax(null);

    if (assessment?.owner.city) {
      setTaxLoading(true);
      try {
        const rate = await fetchTownTaxRate(assessment.owner.city);
        setTownTax(rate);
        // Pre-patch taxRate into the draft so it's ready when plan is selected
        setCheckoutDraft((prev) => ({ ...prev, taxRate: rate.totalRate }));
      } finally {
        setTaxLoading(false);
      }
    }
  }

  /* ── Step 2 ──────────────────────────────────────────────────────────── */

  function updateCheckout(patch: Partial<CheckoutData>) {
    setCheckoutDraft((prev) => ({ ...prev, ...patch }));
  }

  /* ── Persistence ─────────────────────────────────────────────────────── */

  async function persist(overrides: Partial<Assessment> = {}): Promise<Assessment | null> {
    if (!selectedAssessment) return null;
    setIsSaving(true);
    try {
      const saved = await updateAssessment({
        ...selectedAssessment,
        checkout: checkoutDraft as CheckoutData,
        updatedAt: new Date().toISOString(),
        ...overrides,
      });
      setSelectedAssessment(saved);
      return saved;
    } catch (err) {
      showDialog({
        tone: "error",
        title: "Could not save",
        body: err instanceof Error ? err.message : "Please try again.",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  async function saveDraft() {
    if (!selectedAssessment) {
      showDialog({ tone: "error", title: "No client selected", body: "Pick a client in Step 1 first." });
      return;
    }
    const saved = await persist();
    if (saved) {
      showToast({ tone: "success", title: "Draft saved", description: "Quote progress saved." });
    }
  }

  /* ── Step 5: mark complete ───────────────────────────────────────────── */

  async function completeJob() {
    if (!selectedAssessment || !checkoutDraft.planId) {
      showDialog({ tone: "error", title: "Quote incomplete", body: "Go back to Step 2 and select a plan first." });
      return;
    }
    const plan = getCheckoutPlan(checkoutDraft.planId);
    const paymentOption = checkoutDraft.paymentOption ?? "full";
    // Use town-specific rate if available, otherwise fall back to draft or 6%
    const effectiveTaxRate   = townTax?.totalRate ?? checkoutDraft.taxRate ?? 0.06;
    const discountAmount = checkoutDraft.discountAmount ?? 0;
    const amounts = plan
      ? buildCheckoutAmounts(plan, paymentOption, effectiveTaxRate, discountAmount)
      : { taxRate: effectiveTaxRate, taxAmount: 0, totalAmount: checkoutDraft.planPrice ?? 0 };
    const fullCheckout: CheckoutData = {
      planId: checkoutDraft.planId,
      planName: checkoutDraft.planName ?? "",
      planPrice: checkoutDraft.planPrice ?? 0,
      paymentOption,
      contractNote: checkoutDraft.contractNote ?? "",
      createdAt: checkoutDraft.createdAt ?? new Date().toISOString(),
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      discountNote: checkoutDraft.discountNote || undefined,
      ...amounts,
    };
    const saved = await persist({ status: "finished", checkout: fullCheckout });
    if (saved) {
      startTransition(() => setCompleted(true));
      showToast({ tone: "success", title: "Job complete!", description: `${saved.owner.name} is marked finished.` });
    }
  }

  /* ── Validation ──────────────────────────────────────────────────────── */

  function validateStep(s: number): string[] {
    if (s === 1) return selectedAssessment ? [] : ["Select a client to continue."];
    if (s === 2) return checkoutDraft.planId ? [] : ["Select a service plan to continue."];
    return [];
  }

  /* ── Navigation ──────────────────────────────────────────────────────── */

  async function nextStep() {
    if (step === STEPPER_STEPS.length) {
      await completeJob();
      return;
    }

    const errors = validateStep(step);
    if (errors.length > 0) {
      showDialog({ tone: "error", title: "Complete this step first", body: errors.join("\n") });
      return;
    }

    if (step === 2) {
      const saved = await persist();
      if (!saved) return;
      showToast({
        tone: "success",
        title: "Quote saved",
        description: `${checkoutDraft.planName} attached to ${selectedAssessment!.owner.name}.`,
      });
    } else if (step === 1) {
      showToast({
        tone: "success",
        title: "Client selected",
        description: `Building quote for ${selectedAssessment!.owner.name}.`,
      });
    }

    startTransition(() => setStep((s) => s + 1));
  }

  function prevStep() {
    if (step > 1) startTransition(() => setStep((s) => s - 1));
  }

  /* ── Lifecycle ───────────────────────────────────────────────────────── */

  function reset() {
    setStep(1);
    setSelectedAssessment(null);
    setCheckoutDraft({});
    setTownTax(null);
    setTaxLoading(false);
    setIsSaving(false);
    setCompleted(false);
  }

  return {
    step,
    isSaving,
    taxLoading,
    townTax,
    completed,
    selectedAssessment,
    checkoutDraft,
    totalSteps: STEPPER_STEPS.length,
    selectClient,
    updateCheckout,
    saveDraft,
    completeJob,
    nextStep,
    prevStep,
    reset,
  };
}
