'use client';

import { useState, useEffect, useCallback } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  paused?: boolean;
  skipToEnd?: boolean;
}

export function TypingEffect({
  text,
  speed = 30,
  onComplete,
  paused = false,
  skipToEnd = false,
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const completeAnimation = useCallback(() => {
    setDisplayedText(text);
    setIsComplete(true);
    onComplete?.();
  }, [text, onComplete]);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (skipToEnd || prefersReducedMotion) {
      completeAnimation();
      return;
    }

    if (paused) return;

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, paused, skipToEnd, onComplete, completeAnimation]);

  return (
    <span className="typing-effect">
      <span className="typing-effect-text">{displayedText}</span>
      {!isComplete && (
        <span className="typing-effect-cursor" aria-hidden="true">
          |
        </span>
      )}
    </span>
  );
}
