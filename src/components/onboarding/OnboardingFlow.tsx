'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConversationThread } from '../conversation/ConversationThread';
import { AcornIcon } from '../icons';
import {
  OnboardingData,
  BackgroundColorId,
  TextColorId,
  FontFamilyId,
  COLORS,
  FONTS,
  getColorById,
  getFontById,
  getValidTextColors,
  isValidPairing,
} from './types';
import type { Message, ContentBlock, UserResponseContent } from '../conversation/types';

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

// Define the conversation steps
type StepType = 'welcome' | 'name-ask' | 'name-input' | 'visuals-intro' | 'background-select' | 'text-select' | 'font-select' | 'complete';

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

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<StepType>('welcome');
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
  const [nameInput, setNameInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Step number mapping for persistence
  const stepToNumber = (s: StepType): number => {
    const map: Record<StepType, number> = {
      'welcome': 0, 'name-ask': 1, 'name-input': 1, 'visuals-intro': 2,
      'background-select': 2, 'text-select': 2, 'font-select': 2, 'complete': 3
    };
    return map[s];
  };

  // Load saved progress on mount
  useEffect(() => {
    const saved = loadProgress();
    if (saved && saved.data.name) {
      // Resume from where they left off
      setData(saved.data);
      if (saved.step >= 3) {
        setStep('complete');
      } else if (saved.step >= 2) {
        setStep('visuals-intro');
      } else if (saved.step >= 1) {
        setNameInput(saved.data.name);
        setStep('name-ask');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save progress on changes
  useEffect(() => {
    if (isLoaded && step !== 'welcome') {
      saveProgress(stepToNumber(step), data);
    }
  }, [step, data, isLoaded]);

  // Apply live theme preview during visuals selection
  useEffect(() => {
    if (data.backgroundColor) {
      const bg = getColorById(data.backgroundColor);
      document.documentElement.style.setProperty('--color-bg', bg.hex);
      document.documentElement.setAttribute(
        'data-theme',
        bg.isLight ? 'light' : 'dark'
      );
    }
    if (data.textColor) {
      const text = getColorById(data.textColor);
      document.documentElement.style.setProperty('--color-text', text.hex);
    }
    if (data.font) {
      const font = getFontById(data.font);
      document.documentElement.style.setProperty('--font-body', font.family);
    }
  }, [data.backgroundColor, data.textColor, data.font]);

  // Focus input when showing name input
  useEffect(() => {
    if (step === 'name-input') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  // Build messages for conversation thread
  const messages: Message[] = [];
  let msgId = 0;

  // Welcome message (always shown)
  if (step !== 'welcome') {
    messages.push({
      id: `msg-${msgId++}`,
      type: 'content',
      data: [
        { type: 'heading', level: 1, text: 'Your Career Journey Starts Here' },
        { type: 'paragraph', text: "A guided journey to discover your career path. We'll explore your values, skills, and interests together — one conversation at a time." },
      ] as ContentBlock[],
      timestamp: new Date(),
    });
  }

  // Name question and response
  if (['name-ask', 'name-input', 'visuals-intro', 'background-select', 'text-select', 'font-select', 'complete'].includes(step)) {
    messages.push({
      id: `msg-${msgId++}`,
      type: 'content',
      data: [{ type: 'paragraph', text: "What should we call you?" }] as ContentBlock[],
      timestamp: new Date(),
    });
  }

  // Name response (if name submitted)
  if (data.name && ['visuals-intro', 'background-select', 'text-select', 'font-select', 'complete'].includes(step)) {
    messages.push({
      id: `msg-${msgId++}`,
      type: 'user',
      data: { type: 'text', value: data.name } as UserResponseContent,
      timestamp: new Date(),
    });
  }

  // Visuals intro
  if (['visuals-intro', 'background-select', 'text-select', 'font-select', 'complete'].includes(step)) {
    messages.push({
      id: `msg-${msgId++}`,
      type: 'content',
      data: [
        { type: 'paragraph', text: `Nice to meet you, ${data.name}! Let's make this space yours.` },
        { type: 'paragraph', text: "Choose colors and a font that feel right to you. You can change these anytime." },
      ] as ContentBlock[],
      timestamp: new Date(),
    });
  }

  // Background selection and response
  if (['background-select', 'text-select', 'font-select', 'complete'].includes(step)) {
    messages.push({
      id: `msg-${msgId++}`,
      type: 'content',
      data: [{ type: 'paragraph', text: "First, pick a background color:" }] as ContentBlock[],
      timestamp: new Date(),
    });
  }

  if (data.backgroundColor && ['text-select', 'font-select', 'complete'].includes(step)) {
    const bg = getColorById(data.backgroundColor);
    messages.push({
      id: `msg-${msgId++}`,
      type: 'user',
      data: { type: 'text', value: bg.name } as UserResponseContent,
      timestamp: new Date(),
    });
  }

  // Text color selection and response
  if (['text-select', 'font-select', 'complete'].includes(step)) {
    messages.push({
      id: `msg-${msgId++}`,
      type: 'content',
      data: [{ type: 'paragraph', text: "Now pick a text color:" }] as ContentBlock[],
      timestamp: new Date(),
    });
  }

  if (data.textColor && ['font-select', 'complete'].includes(step)) {
    const text = getColorById(data.textColor);
    messages.push({
      id: `msg-${msgId++}`,
      type: 'user',
      data: { type: 'text', value: text.name } as UserResponseContent,
      timestamp: new Date(),
    });
  }

  // Font selection and response
  if (['font-select', 'complete'].includes(step)) {
    messages.push({
      id: `msg-${msgId++}`,
      type: 'content',
      data: [{ type: 'paragraph', text: "Finally, choose a font:" }] as ContentBlock[],
      timestamp: new Date(),
    });
  }

  if (data.font && step === 'complete') {
    const font = getFontById(data.font);
    messages.push({
      id: `msg-${msgId++}`,
      type: 'user',
      data: { type: 'text', value: font.name } as UserResponseContent,
      timestamp: new Date(),
    });

    // Complete message
    messages.push({
      id: `msg-${msgId++}`,
      type: 'content',
      data: [
        { type: 'heading', level: 2, text: `You're all set, ${data.name}!` },
        { type: 'paragraph', text: "Your dreamtree journey begins now. We'll start by exploring what matters most to you — your values, interests, and the skills you've built along the way." },
        { type: 'emphasis', text: "Take your time. There are no wrong answers here." },
      ] as ContentBlock[],
      timestamp: new Date(),
    });
  }

  // Handlers
  const handleContinue = useCallback(() => {
    switch (step) {
      case 'welcome':
        setStep('name-ask');
        break;
      case 'name-ask':
        setStep('name-input');
        break;
      case 'visuals-intro':
        setStep('background-select');
        break;
      case 'complete':
        clearProgress();
        onComplete(data as OnboardingData);
        break;
    }
  }, [step, data, onComplete]);

  const handleNameSubmit = useCallback(() => {
    if (nameInput.trim()) {
      setData(prev => ({ ...prev, name: nameInput.trim() }));
      setStep('visuals-intro');
    }
  }, [nameInput]);

  const handleBackgroundSelect = useCallback((bgId: BackgroundColorId) => {
    setData(prev => {
      const newData = { ...prev, backgroundColor: bgId };
      // Auto-clear text color if pairing becomes invalid
      if (prev.textColor && !isValidPairing(bgId, prev.textColor)) {
        newData.textColor = getValidTextColors(bgId)[0];
      }
      return newData;
    });
    setStep('text-select');
  }, []);

  const handleTextSelect = useCallback((textId: TextColorId) => {
    setData(prev => ({ ...prev, textColor: textId }));
    setStep('font-select');
  }, []);

  const handleFontSelect = useCallback((fontId: FontFamilyId) => {
    setData(prev => ({ ...prev, font: fontId }));
    setStep('complete');
  }, []);

  // Global Enter key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (step === 'welcome' || step === 'name-ask' || step === 'visuals-intro' || step === 'complete') {
          e.preventDefault();
          handleContinue();
        } else if (step === 'name-input' && nameInput.trim()) {
          e.preventDefault();
          handleNameSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, nameInput, handleContinue, handleNameSubmit]);

  // Don't render until we've checked localStorage
  if (!isLoaded) {
    return (
      <div className="onboarding-chat">
        <div className="onboarding-chat-content" />
      </div>
    );
  }

  return (
    <div className="onboarding-chat">
      {/* Welcome screen - special full-screen treatment */}
      {step === 'welcome' && (
        <div className="onboarding-welcome">
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
            onClick={handleContinue}
          >
            Get Started
          </button>
        </div>
      )}

      {/* Chat-style flow for remaining steps */}
      {step !== 'welcome' && (
        <>
          <div className="onboarding-chat-content">
            <ConversationThread
              messages={messages}
              autoScrollOnNew={true}
            />

            {/* Name input */}
            {step === 'name-input' && (
              <div className="onboarding-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  className="onboarding-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  autoComplete="given-name"
                />
                <button
                  className="button button-primary"
                  onClick={handleNameSubmit}
                  disabled={!nameInput.trim()}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Background color selection */}
            {step === 'background-select' && (
              <div className="onboarding-selection-area">
                <div className="onboarding-swatches">
                  {COLORS.map((color) => (
                    <button
                      key={color.id}
                      className="color-swatch color-swatch-lg"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => handleBackgroundSelect(color.id)}
                      aria-label={color.name}
                      title={color.name}
                    >
                      <span className="color-swatch-label" style={{ color: color.isLight ? '#1A1A1A' : '#FAF8F5' }}>
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text color selection */}
            {step === 'text-select' && (
              <div className="onboarding-selection-area">
                <div className="onboarding-swatches">
                  {COLORS.map((color) => {
                    const isValid = data.backgroundColor ? isValidPairing(data.backgroundColor, color.id) : true;
                    return (
                      <button
                        key={color.id}
                        className="color-swatch color-swatch-lg"
                        style={{ backgroundColor: color.hex, opacity: isValid ? 1 : 0.3 }}
                        onClick={() => isValid && handleTextSelect(color.id)}
                        disabled={!isValid}
                        aria-label={`${color.name}${!isValid ? ' (not enough contrast)' : ''}`}
                        title={isValid ? color.name : `${color.name} - not enough contrast`}
                      >
                        <span className="color-swatch-label" style={{ color: color.isLight ? '#1A1A1A' : '#FAF8F5' }}>
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Font selection */}
            {step === 'font-select' && (
              <div className="onboarding-selection-area">
                <div className="onboarding-fonts">
                  {FONTS.map((fontOption) => (
                    <button
                      key={fontOption.id}
                      className="font-choice"
                      onClick={() => handleFontSelect(fontOption.id)}
                      aria-label={fontOption.name}
                    >
                      <span
                        className="font-choice-sample"
                        style={{ fontFamily: fontOption.family }}
                      >
                        {fontOption.sampleText}
                      </span>
                      <span className="font-choice-name">{fontOption.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Continue button for message-only steps */}
            {(step === 'name-ask' || step === 'visuals-intro') && (
              <div className="onboarding-continue">
                <button
                  className="button button-primary"
                  onClick={handleContinue}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Complete - Begin Journey button */}
            {step === 'complete' && (
              <div className="onboarding-continue">
                <button
                  className="button button-primary button-lg"
                  onClick={handleContinue}
                >
                  Begin My Journey
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
