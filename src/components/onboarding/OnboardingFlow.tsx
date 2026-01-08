'use client';

import { useState, useEffect, useCallback } from 'react';
import { WelcomeStep } from './WelcomeStep';
import { NameStep } from './NameStep';
import { VisualsStep } from './VisualsStep';
import { CompleteStep } from './CompleteStep';
import { OnboardingProgress } from './OnboardingProgress';
import {
  OnboardingData,
  BackgroundColorId,
  TextColorId,
  FontFamilyId,
  getColorById,
  getFontById,
} from './types';

const STORAGE_KEY = 'dreamtree_onboarding';
const STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
  initialStep?: number;
}

interface StoredProgress {
  step: number;
  data: {
    name: string;
    backgroundColor: BackgroundColorId | null;
    textColor: TextColorId | null;
    font: FontFamilyId | null;
  };
  timestamp: number;
}

function saveProgress(step: number, data: StoredProgress['data']) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ step, data, timestamp: Date.now() })
  );
}

function loadProgress(): StoredProgress | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    const parsed: StoredProgress = JSON.parse(saved);
    if (Date.now() - parsed.timestamp > STORAGE_EXPIRY) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function OnboardingFlow({ onComplete, initialStep = 0 }: OnboardingFlowProps) {
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<{
    name: string;
    backgroundColor: BackgroundColorId | null;
    textColor: TextColorId | null;
    font: FontFamilyId | null;
  }>({
    name: '',
    backgroundColor: null,
    textColor: null,
    font: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setStep(saved.step);
      setData(saved.data);
    }
    setIsLoaded(true);
  }, []);

  // Save progress on changes
  useEffect(() => {
    if (isLoaded && step > 0) {
      saveProgress(step, data);
    }
  }, [step, data, isLoaded]);

  // Apply live theme preview during visuals step
  useEffect(() => {
    if (step === 2 && data.backgroundColor) {
      const bg = getColorById(data.backgroundColor);
      document.documentElement.style.setProperty('--color-bg', bg.hex);
      document.documentElement.setAttribute(
        'data-theme',
        bg.isLight ? 'light' : 'dark'
      );
    }
    if (step === 2 && data.textColor) {
      const text = getColorById(data.textColor);
      document.documentElement.style.setProperty('--color-text', text.hex);
    }
    if (step === 2 && data.font) {
      const font = getFontById(data.font);
      document.documentElement.style.setProperty('--font-body', font.family);
    }
  }, [step, data.backgroundColor, data.textColor, data.font]);

  const canProceed = useCallback(() => {
    switch (step) {
      case 0:
        return true; // Welcome
      case 1:
        return (data.name?.trim().length || 0) > 0;
      case 2:
        return data.backgroundColor && data.textColor && data.font;
      case 3:
        return true; // Complete
      default:
        return false;
    }
  }, [step, data]);

  const handleNext = () => {
    if (step === 3) {
      clearProgress();
      onComplete(data as OnboardingData);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // Don't render until we've checked localStorage
  if (!isLoaded) {
    return (
      <div className="onboarding-flow">
        <div className="onboarding-content" />
      </div>
    );
  }

  return (
    <div className="onboarding-flow">
      <div className="onboarding-content">
        {step === 0 && <WelcomeStep onContinue={handleNext} />}

        {step === 1 && (
          <NameStep
            value={data.name || ''}
            onChange={(name) => setData({ ...data, name })}
          />
        )}

        {step === 2 && (
          <VisualsStep
            backgroundColor={data.backgroundColor || null}
            textColor={data.textColor || null}
            font={data.font || null}
            onBackgroundChange={(bg) => setData({ ...data, backgroundColor: bg })}
            onTextColorChange={(textColor) => setData({ ...data, textColor })}
            onFontChange={(font) => setData({ ...data, font })}
          />
        )}

        {step === 3 && (
          <CompleteStep name={data.name || ''} onComplete={handleNext} />
        )}
      </div>

      {step > 0 && step < 3 && (
        <div className="onboarding-footer">
          <button className="button button-ghost button-md" onClick={handleBack}>
            Back
          </button>
          <OnboardingProgress totalSteps={4} currentStep={step} />
          <button
            className="button button-primary button-md"
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {step === 2 ? 'Finish' : 'Continue'}
          </button>
        </div>
      )}
    </div>
  );
}
