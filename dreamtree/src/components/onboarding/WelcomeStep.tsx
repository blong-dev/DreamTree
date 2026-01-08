'use client';

import { AcornIcon } from '../icons';

interface WelcomeStepProps {
  onContinue: () => void;
}

export function WelcomeStep({ onContinue }: WelcomeStepProps) {
  return (
    <div className="welcome-step">
      <div className="welcome-brand" aria-hidden="true">
        <AcornIcon className="welcome-brand-icon" />
        <span className="welcome-brand-text">dreamtree</span>
      </div>

      <h1 className="welcome-title">Your Career Journey Starts Here</h1>

      <p className="welcome-description">
        A guided journey to discover your career path. We&apos;ll explore your
        values, skills, and interests together — one conversation at a time.
      </p>

      <button
        className="button button-primary button-lg"
        onClick={onContinue}
      >
        Get Started
      </button>
    </div>
  );
}
