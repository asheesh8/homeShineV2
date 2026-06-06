export function StepPlaceholder({
  stepNum,
  label,
  description,
}: {
  stepNum: number;
  label: string;
  description: string;
}) {
  return (
    <div className="hs-stepper-step">
      <div className="hs-step-heading">
        <span className="hs-step-eyebrow">Step {stepNum} of 6</span>
        <h2>{label}</h2>
        <p className="hs-step-description">{description}</p>
      </div>

      <div className="hs-step-placeholder-card">
        <div className="hs-step-placeholder-icon">🔧</div>
        <p className="hs-step-placeholder-title">Coming next</p>
        <p className="hs-step-placeholder-body">
          This step is being built. Use Back to return to Step 1, or Save Draft to preserve your progress.
        </p>
      </div>
    </div>
  );
}
