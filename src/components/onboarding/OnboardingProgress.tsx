'use client';

interface OnboardingProgressProps {
  totalSteps: number;
  currentStep: number;
}

export function OnboardingProgress({ totalSteps, currentStep }: OnboardingProgressProps) {
  return (
    <div
      className="onboarding-progress"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <span
          key={i}
          className="onboarding-progress-dot"
          data-active={i === currentStep}
          data-complete={i < currentStep}
        />
      ))}
    </div>
  );
}
