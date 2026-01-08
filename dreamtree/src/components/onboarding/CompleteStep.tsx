'use client';

interface CompleteStepProps {
  name: string;
  onComplete: () => void;
}

export function CompleteStep({ name, onComplete }: CompleteStepProps) {
  return (
    <div className="complete-step">
      <div className="complete-icon" aria-hidden="true">
        ✨
      </div>

      <h2 className="complete-title">You&apos;re all set, {name}!</h2>

      <p className="complete-description">
        Your DreamTree journey begins now. We&apos;ll start by exploring what
        matters most to you — your values, interests, and the skills you&apos;ve
        built along the way.
      </p>

      <p className="complete-note">
        Take your time. There are no wrong answers here.
      </p>

      <button
        className="button button-primary button-lg"
        onClick={onComplete}
      >
        Begin My Journey
      </button>
    </div>
  );
}
