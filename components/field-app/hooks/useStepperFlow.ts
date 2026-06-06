"use client";

import { startTransition, useState } from "react";
import type { DialogState, ToastState } from "@/components/field-app/types";
import { createAssessment, updateAssessment } from "@/components/field-app/api";
import { emptyOwner, makeAssessment, type Assessment, type Owner } from "@/lib/simple-field";

export const STEPPER_STEPS = [
  { label: "Property",     short: "Prop"   },
  { label: "Observations", short: "Obs"    },
  { label: "Quote",        short: "Quote"  },
  { label: "Review",       short: "Review" },
  { label: "Payment",      short: "Pay"    },
  { label: "Complete",     short: "Done"   },
] as const;

export type StepperStep = (typeof STEPPER_STEPS)[number];

type NotifyFns = {
  showToast: (t: ToastState) => void;
  showDialog: (d: DialogState) => void;
};

export function useStepperFlow({ showToast, showDialog }: NotifyFns) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Full in-memory assessment draft — updated as the user fills each step
  const [draft, setDraft] = useState<Assessment>(() => ({
    ...makeAssessment(),
    status: "ongoing",
    owner: { ...emptyOwner },
  }));

  /* ── field updaters ─────────────────────────────────────────────────── */

  function updateOwner<K extends keyof Owner>(field: K, value: Owner[K]) {
    setDraft((prev) => ({ ...prev, owner: { ...prev.owner, [field]: value } }));
  }

  function updateWriteup(value: string) {
    setDraft((prev) => ({ ...prev, writeup: value }));
  }

  // Generic escape hatch for updating sections from later steps
  function updateSection(sectionId: string, data: Record<string, string | number | boolean>) {
    setDraft((prev) => ({
      ...prev,
      sections: { ...prev.sections, [sectionId]: data },
    }));
  }

  /* ── persistence ────────────────────────────────────────────────────── */

  async function persist(): Promise<Assessment | null> {
    setIsSaving(true);
    try {
      const toSave = { ...draft, updatedAt: new Date().toISOString() };
      let saved: Assessment;
      if (savedId) {
        saved = await updateAssessment({ ...toSave, id: savedId });
      } else {
        saved = await createAssessment(toSave);
        setSavedId(saved.id);
        setDraft(saved);
      }
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
    const saved = await persist();
    if (saved) {
      showToast({ tone: "success", title: "Draft saved", description: "Progress has been saved." });
    }
  }

  /* ── step validation ────────────────────────────────────────────────── */

  function validateStep1(): string[] {
    const { owner } = draft;
    return [
      !owner.name    && "Owner name",
      !owner.street  && "Street address",
      !owner.city    && "City / Town",
      !owner.state   && "State",
      !owner.phone   && "Phone",
      !owner.email   && "Email",
    ].filter(Boolean) as string[];
  }

  /* ── navigation ─────────────────────────────────────────────────────── */

  async function nextStep() {
    // Validate the current step before advancing
    let errors: string[] = [];
    if (step === 1) errors = validateStep1();

    if (errors.length > 0) {
      showDialog({
        tone: "error",
        title: "Complete this step first",
        body: `Missing:\n\n${errors.join("\n")}`,
      });
      return;
    }

    // Always persist on step advance
    const saved = await persist();
    if (!saved) return;

    if (step === 1) {
      showToast({
        tone: "success",
        title: "Property info saved",
        description: `Draft created for ${saved.owner.name}.`,
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
    setDraft({ ...makeAssessment(), status: "ongoing", owner: { ...emptyOwner } });
    setSavedId(null);
    setIsSaving(false);
  }

  return {
    step,
    draft,
    isSaving,
    savedId,
    totalSteps: STEPPER_STEPS.length,
    updateOwner,
    updateWriteup,
    updateSection,
    saveDraft,
    nextStep,
    prevStep,
    reset,
  };
}
