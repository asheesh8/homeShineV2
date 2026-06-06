"use client";

import { startTransition, useState } from "react";
import type { DialogState, ToastState } from "@/components/field-app/types";
import { updateAssessment } from "@/components/field-app/api";
import { type Assessment, type CheckoutData } from "@/lib/simple-field";

export const STEPPER_STEPS = [
  { label: "Client",   short: "Client" },
  { label: "Quote",    short: "Quote"  },
  { label: "Review",   short: "Review" },
  { label: "Payment",  short: "Pay"    },
  { label: "Complete", short: "Done"   },
] as const;

export type StepperStep = (typeof STEPPER_STEPS)[number];

type NotifyFns = {
  showToast: (t: ToastState) => void;
  showDialog: (d: DialogState) => void;
};

export function useStepperFlow({ showToast, showDialog }: NotifyFns) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // The assessment selected in Step 1 — this is the source of truth for client data
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  // Checkout draft built up through steps 2-5
  const [checkoutDraft, setCheckoutDraft] = useState<Partial<CheckoutData>>({});

  /* ── Step 1: client selection ───────────────────────────────────────── */

  function selectClient(assessment: Assessment | null) {
    setSelectedAssessment(assessment);
  }

  /* ── Step 2+: checkout data ─────────────────────────────────────────── */

  function updateCheckout(patch: Partial<CheckoutData>) {
    setCheckoutDraft((prev) => ({ ...prev, ...patch }));
  }

  /* ── persistence ────────────────────────────────────────────────────── */

  // Attach the checkout draft to the selected assessment in Supabase
  async function persist(): Promise<Assessment | null> {
    if (!selectedAssessment) return null;
    setIsSaving(true);
    try {
      const saved = await updateAssessment({
        ...selectedAssessment,
        checkout: checkoutDraft as CheckoutData,
        updatedAt: new Date().toISOString(),
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
      showToast({ tone: "error", title: "No client selected", description: "Pick a client in Step 1 first." });
      return;
    }
    const saved = await persist();
    if (saved) {
      showToast({ tone: "success", title: "Draft saved", description: "Quote progress saved." });
    }
  }

  /* ── step validation ────────────────────────────────────────────────── */

  function validateStep1(): string[] {
    return selectedAssessment ? [] : ["Select a client to continue."];
  }

  /* ── navigation ─────────────────────────────────────────────────────── */

  async function nextStep() {
    let errors: string[] = [];
    if (step === 1) errors = validateStep1();

    if (errors.length > 0) {
      showDialog({
        tone: "error",
        title: "Complete this step first",
        body: errors.join("\n"),
      });
      return;
    }

    // Persist when leaving step 1 (attaches checkout shell to the assessment)
    if (step === 1 && selectedAssessment) {
      showToast({
        tone: "success",
        title: "Client selected",
        description: `Building quote for ${selectedAssessment.owner.name}.`,
      });
    }

    if (step < STEPPER_STEPS.length) {
      startTransition(() => setStep((s) => s + 1));
    }
  }

  function prevStep() {
    if (step > 1) startTransition(() => setStep((s) => s - 1));
  }

  /* ── lifecycle ──────────────────────────────────────────────────────── */

  function reset() {
    setStep(1);
    setSelectedAssessment(null);
    setCheckoutDraft({});
    setIsSaving(false);
  }

  return {
    step,
    isSaving,
    selectedAssessment,
    checkoutDraft,
    totalSteps: STEPPER_STEPS.length,
    selectClient,
    updateCheckout,
    saveDraft,
    nextStep,
    prevStep,
    reset,
  };
}
