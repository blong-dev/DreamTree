'use client';

import { useEffect, useRef } from 'react';

interface NameStepProps {
  value: string;
  onChange: (name: string) => void;
}

export function NameStep({ value, onChange }: NameStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="name-step">
      <h2 className="name-step-title">What should we call you?</h2>

      <p className="name-step-description">
        This is how DreamTree will address you throughout your journey.
      </p>

      <div className="text-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your name"
          maxLength={50}
          autoComplete="given-name"
        />
      </div>

      <p className="name-step-helper">
        You can always change this later in your profile.
      </p>
    </div>
  );
}
