"use client";

import { ArrowLeft, ArrowRight, Save, X } from "lucide-react";
import { Button } from "@/components/field-app/ui";
import { STEPPER_STEPS } from "@/components/field-app/hooks/useStepperFlow";
import { Step1ClientSelect } from "@/components/field-app/stepper/steps/Step1ClientSelect";
import { StepPlaceholder } from "@/components/field-app/stepper/steps/StepPlaceholder";
import type { useStepperFlow } from "@/components/field-app/hooks/useStepperFlow";
import type { Assessment } from "@/lib/simple-field";

type StepperFlowReturn = ReturnType<typeof useStepperFlow>;

export function StepperShell({
  flow,
  assessments,
  onExit,
}: {
  flow: StepperFlowReturn;
  assessments: Assessment[] | null;
  onExit: () => void;
}) {
  const { step, isSaving, selectedAssessment, selectClient, nextStep, prevStep, saveDraft } = flow;

  const isFirst = step === 1;
  const isLast  = step === STEPPER_STEPS.length;

  return (
    <div className="hs-stepper-page">

      {/* ── Top bar: exit + step indicator ──────────────────────────── */}
      <div className="hs-stepper-topbar">
        <button type="button" className="hs-stepper-exit" onClick={onExit} aria-label="Exit to pipeline">
          <X size={18} />
        </button>

        <div className="hs-step-bar">
          {STEPPER_STEPS.map((s, i) => {
            const num    = i + 1;
            const done   = num < step;
            const active = num === step;
            return (
              <div key={s.label} className="hs-step-item">
                <div className={`hs-step-circle ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
                  {done ? "✓" : num}
                </div>
                <span className={`hs-step-label ${done ? "is-done" : active ? "is-active" : ""}`}>
                  {s.short}
                </span>
                {i < STEPPER_STEPS.length - 1 && (
                  <div className={`hs-step-connector ${done ? "is-done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Step content ─────────────────────────────────────────────── */}
      <div className="hs-stepper-body">
        <div className="hs-stepper-content hs-screen-enter" key={`step-${step}`}>

          {step === 1 && (
            <Step1ClientSelect
              assessments={assessments}
              selectedId={selectedAssessment?.id ?? null}
              onSelect={selectClient}
            />
          )}

          {step === 2 && (
            <StepPlaceholder
              stepNum={2}
              label="Quote Builder"
              description="Choose a service plan, add line items, set the price, and select the payment method."
            />
          )}

          {step === 3 && (
            <StepPlaceholder
              stepNum={3}
              label="Review & Send"
              description="Preview the client packet and send the quote to the homeowner for approval."
            />
          )}

          {step === 4 && (
            <StepPlaceholder
              stepNum={4}
              label="Payment Link"
              description="Generate a Stripe payment link once the client approves. Steven triggers this."
            />
          )}

          {step === 5 && (
            <StepPlaceholder
              stepNum={5}
              label="Complete"
              description="Mark the job done, generate the receipt, and close out the record in Supabase."
            />
          )}

        </div>
      </div>

      {/* ── Sticky footer ────────────────────────────────────────────── */}
      <div className="hs-stepper-footer">
        <Button type="button" variant="ghost" onClick={prevStep} disabled={isFirst || isSaving}>
          <ArrowLeft size={16} />
          Back
        </Button>

        <Button type="button" variant="secondary" onClick={saveDraft} disabled={isSaving}>
          <Save size={15} />
          {isSaving ? "Saving…" : "Save draft"}
        </Button>

        <Button type="button" onClick={nextStep} disabled={isSaving}>
          {isLast ? "Complete" : "Next"}
          {!isLast && <ArrowRight size={16} />}
        </Button>
      </div>
    </div>
  );
}
