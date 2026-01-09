'use client';

import { useState, useEffect, useRef } from 'react';

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

  // Use ref for callback to avoid restarting animation when callback changes
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Track if this effect has already completed (to prevent double-fire)
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    // Reset completion tracking when text changes
    hasCompletedRef.current = false;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (skipToEnd || prefersReducedMotion) {
      setDisplayedText(text);
      setIsComplete(true);
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current?.();
      }
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
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onCompleteRef.current?.();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, paused, skipToEnd]); // Removed onComplete from deps - using ref instead

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
