"use client";

import { ArrowLeft, ArrowRight, Save, X } from "lucide-react";
import { Button } from "@/components/field-app/ui";
import { STEPPER_STEPS } from "@/components/field-app/hooks/useStepperFlow";
import { Step1Property } from "@/components/field-app/stepper/steps/Step1Property";
import { StepPlaceholder } from "@/components/field-app/stepper/steps/StepPlaceholder";
import type { useStepperFlow } from "@/components/field-app/hooks/useStepperFlow";

type StepperFlowReturn = ReturnType<typeof useStepperFlow>;

export function StepperShell({
  flow,
  onExit,
  townMatches,
  stateMatches,
}: {
  flow: StepperFlowReturn;
  onExit: () => void;
  townMatches: string[];
  stateMatches: string[];
}) {
  const { step, draft, isSaving, totalSteps, nextStep, prevStep, saveDraft, updateOwner, updateWriteup } = flow;

  const isFirst = step === 1;
  const isLast  = step === totalSteps;

  return (
    <div className="hs-stepper-page">

      {/* ── top bar: step indicator ──────────────────────────────────── */}
      <div className="hs-stepper-topbar">
        <button type="button" className="hs-stepper-exit" onClick={onExit} aria-label="Exit to pipeline">
          <X size={18} />
        </button>

        <div className="hs-step-bar">
          {STEPPER_STEPS.map((s, i) => {
            const num   = i + 1;
            const done  = num < step;
            const active = num === step;
            return (
              <div key={s.label} className="hs-step-item">
                <div
                  className={`hs-step-circle ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}
                  aria-label={`Step ${num}: ${s.label}${done ? " (completed)" : active ? " (current)" : ""}`}
                >
                  {done ? "✓" : num}
                </div>
                <span className={`hs-step-label ${done || active ? (done ? "is-done" : "is-active") : ""}`}>{s.short}</span>
                {i < STEPPER_STEPS.length - 1 && (
                  <div className={`hs-step-connector ${done ? "is-done" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── step content ─────────────────────────────────────────────── */}
      <div className="hs-stepper-body">
        <div className="hs-stepper-content hs-screen-enter" key={`step-${step}`}>
          {step === 1 && (
            <Step1Property
              owner={draft.owner}
              writeup={draft.writeup}
              townMatches={townMatches}
              stateMatches={stateMatches}
              onOwnerChange={updateOwner}
              onWriteupChange={updateWriteup}
            />
          )}
          {step === 2 && <StepPlaceholder stepNum={2} label="Field Observations" description="Document surface conditions, moss, staining, and other findings for each area of the property." />}
          {step === 3 && <StepPlaceholder stepNum={3} label="Quote Builder" description="Add line items for each service, apply pricing, and build the full scope of work." />}
          {step === 4 && <StepPlaceholder stepNum={4} label="Review & Send" description="Preview the client packet, confirm details, and send the quote directly to the homeowner." />}
          {step === 5 && <StepPlaceholder stepNum={5} label="Payment Link" description="Generate a Stripe payment link once the client approves the quote. Steven triggers this step." />}
          {step === 6 && <StepPlaceholder stepNum={6} label="Complete" description="Mark the job as complete, generate the receipt, and close out the assessment in Supabase." />}
        </div>
      </div>

      {/* ── sticky footer: Back / Save Draft / Next ──────────────────── */}
      <div className="hs-stepper-footer">
        <Button
          type="button"
          variant="ghost"
          onClick={prevStep}
          disabled={isFirst || isSaving}
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={saveDraft}
          disabled={isSaving}
        >
          <Save size={15} />
          {isSaving ? "Saving…" : "Save draft"}
        </Button>

        <Button
          type="button"
          onClick={nextStep}
          disabled={isSaving}
        >
          {isLast ? "Complete" : "Next"}
          {!isLast && <ArrowRight size={16} />}
        </Button>
      </div>
    </div>
  );
}
