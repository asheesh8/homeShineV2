"use client";

import { ArrowLeft, ArrowRight, Save, X } from "lucide-react";
import { Button } from "@/components/field-app/ui";
import { STEPPER_STEPS } from "@/components/field-app/hooks/useStepperFlow";
import { Step1ClientSelect } from "@/components/field-app/stepper/steps/Step1ClientSelect";
import { Step2Quote } from "@/components/field-app/stepper/steps/Step2Quote";
import { Step3Review } from "@/components/field-app/stepper/steps/Step3Review";
import { StepPlaceholder } from "@/components/field-app/stepper/steps/StepPlaceholder";
import { Step5Complete } from "@/components/field-app/stepper/steps/Step5Complete";
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
  const {
    step,
    isSaving,
    completed,
    selectedAssessment,
    checkoutDraft,
    townTax,
    taxLoading,
    selectClient,
    updateCheckout,
    saveDraft,
    nextStep,
    prevStep,
  } = flow;

  const isFirst = step === 1;
  const isLast  = step === STEPPER_STEPS.length;

  /* ── footer label / action ── */
  const nextLabel = isLast
    ? completed ? "Done →" : "Mark as complete"
    : "Next";

  function handleNext() {
    if (isLast && completed) { onExit(); return; }
    void nextStep();
  }

  return (
    <div className="hs-stepper-page">

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <div className="hs-stepper-topbar">
        <button
          type="button"
          className="hs-stepper-exit"
          onClick={onExit}
          aria-label="Exit to pipeline"
        >
          <X size={18} />
        </button>

        <div className="hs-step-bar">
          {STEPPER_STEPS.map((s, i) => {
            const num    = i + 1;
            const done   = num < step || (isLast && completed);
            const active = num === step && !completed;
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

      {/* ── Step content ──────────────────────────────────────────── */}
      <div className="hs-stepper-body">
        <div className="hs-stepper-content hs-screen-enter" key={`step-${step}-${String(completed)}`}>

          {step === 1 && (
            <Step1ClientSelect
              assessments={assessments}
              selectedId={selectedAssessment?.id ?? null}
              onSelect={selectClient}
            />
          )}

          {step === 2 && selectedAssessment && (
            <Step2Quote
              client={selectedAssessment}
              checkout={checkoutDraft}
              townTax={townTax}
              taxLoading={taxLoading}
              onUpdate={updateCheckout}
            />
          )}

          {step === 3 && selectedAssessment && (
            <Step3Review
              client={selectedAssessment}
              checkout={checkoutDraft}
              townTax={townTax}
            />
          )}

          {step === 4 && (
            <StepPlaceholder
              stepNum={4}
              label="Payment Link"
              description="Stripe payment link generation coming soon. Once integrated, Steven will trigger a payment request directly from here after the client approves the quote."
            />
          )}

          {step === 5 && selectedAssessment && (
            <Step5Complete
              client={selectedAssessment}
              checkout={checkoutDraft}
              townTax={townTax}
              completed={completed}
            />
          )}

        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="hs-stepper-footer">
        <Button
          type="button"
          variant="ghost"
          onClick={prevStep}
          disabled={isFirst || isSaving || completed}
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        {!completed && (
          <Button
            type="button"
            variant="secondary"
            onClick={saveDraft}
            disabled={isSaving}
          >
            <Save size={15} />
            {isSaving ? "Saving…" : "Save draft"}
          </Button>
        )}

        {completed && <div />}

        <Button
          type="button"
          onClick={handleNext}
          disabled={isSaving}
        >
          {nextLabel}
          {!isLast && <ArrowRight size={16} />}
        </Button>
      </div>
    </div>
  );
}
